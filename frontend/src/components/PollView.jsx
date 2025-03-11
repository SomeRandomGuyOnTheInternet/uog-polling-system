import { useEffect, useState } from 'react';
import {
  VStack,
  Button,
  IconButton,
  HStack,
  Text,
  Box,
  Progress,
  Badge,
  Select,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { io } from 'socket.io-client';
import BarChartRace from './BarChartRace';

// Use window.location.origin to dynamically determine the backend URL
const SOCKET_URL = window.location.origin;
const API_URL = window.location.origin;

function PollView({ poll, onBack, onError }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [results, setResults] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [socket, setSocket] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(
    poll.active_question_id 
      ? poll.questions.find(q => q.id === poll.active_question_id)
      : poll.questions[0]
  );

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit('join-poll', { pollId: poll.id, joinCode: poll.join_code });

    newSocket.on('response-update', (updatedResults) => {
      setResults(updatedResults);
    });

    newSocket.on('question-change', ({ questionId }) => {
      const newActiveQuestion = poll.questions.find(q => q.id === questionId);
      if (newActiveQuestion) {
        setActiveQuestion(newActiveQuestion);
        setSelectedOption(null);
        setHasVoted(false);
        setResults([]);
      }
    });

    newSocket.on('error', (error) => {
      onError(error);
    });

    return () => {
      newSocket.close();
    };
  }, [poll.join_code, onError, poll.questions]);

  const handleVote = () => {
    if (!selectedOption) {
      onError('Please select an option');
      return;
    }

    socket.emit('submit-response', {
      pollId: poll.id,
      questionId: activeQuestion.id,
      optionId: selectedOption,
      joinCode: poll.join_code,
    });
    setHasVoted(true);
  };

  const handleQuestionChange = async (questionId) => {
    try {
      const response = await fetch(`${API_URL}/api/polls/${poll.id}/active-question`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-poll-password': localStorage.getItem(`poll_${poll.join_code}_password`) || '',
        },
        body: JSON.stringify({ questionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update active question');
      }
    } catch (error) {
      onError(error.message);
    }
  };

  const totalVotes = results.reduce((sum, option) => sum + (option.count || 0), 0);

  const chartData = activeQuestion.options.map(opt => {
    const result = results.find(r => r.id === opt.id);
    return {
      id: opt.id,
      label: opt.option_text,
      count: result ? result.count : 0,
      isCorrect: opt.is_correct
    };
  }).sort((a, b) => b.count - a.count); // Sort by count for racing effect

  return (
    <VStack spacing={6} align="stretch">
      <HStack spacing={4} align="center">
        <IconButton
          icon={<ArrowBackIcon />}
          onClick={onBack}
          aria-label="Go back"
          size="lg"
        />
        <Text fontSize="2xl" fontWeight="600">{poll.title}</Text>
      </HStack>

      {poll.isCreator && (
        <Box>
          <Text fontSize="lg" fontWeight="500" mb={2}>Select Question:</Text>
          <Select
            value={activeQuestion.id}
            onChange={(e) => handleQuestionChange(e.target.value)}
            size="lg"
          >
            {poll.questions.map((question, index) => (
              <option key={question.id} value={question.id}>
                Question {index + 1}: {question.question_text}
              </option>
            ))}
          </Select>
        </Box>
      )}

      <Box p={4} borderWidth={1} borderRadius="lg">
        <Text fontSize="xl" fontWeight="500" mb={4}>
          {activeQuestion.question_text}
        </Text>

        {(hasVoted || poll.isCreator) && (
          <Box height="300px" mb={6}>
            <BarChartRace 
              data={chartData}
              width={800}
              height={300}
            />
          </Box>
        )}

        <VStack spacing={4} align="stretch">
          {activeQuestion.options.map((option) => {
            const result = results.find(r => r.id === option.id);
            const voteCount = result ? result.count : 0;
            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

            return (
              <Box
                key={option.id}
                p={4}
                borderWidth={1}
                borderRadius="md"
                borderColor={selectedOption === option.id ? 'blue.500' : 'gray.200'}
                onClick={() => !hasVoted && setSelectedOption(option.id)}
                cursor={hasVoted ? 'default' : 'pointer'}
                position="relative"
              >
                <HStack justify="space-between">
                  <Text>{option.option_text}</Text>
                  {(hasVoted || poll.isCreator) && option.is_correct && (
                    <Badge colorScheme="green">Correct Answer</Badge>
                  )}
                </HStack>
                {(hasVoted || poll.isCreator) && (
                  <>
                    <Progress
                      value={percentage}
                      size="sm"
                      mt={2}
                      colorScheme="blue"
                    />
                    <Text fontSize="sm" mt={1}>
                      {voteCount} vote{voteCount !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
                    </Text>
                  </>
                )}
              </Box>
            );
          })}
        </VStack>

        {!hasVoted && !poll.isCreator && (
          <Button
            onClick={handleVote}
            colorScheme="blue"
            size="lg"
            width="100%"
            mt={4}
            isDisabled={!selectedOption}
          >
            Submit Vote
          </Button>
        )}

        {(hasVoted || poll.isCreator) && (
          <Text textAlign="center" fontSize="sm" color="gray.500" mt={4}>
            Total Votes: {totalVotes}
          </Text>
        )}
      </Box>
    </VStack>
  );
}

export default PollView;
