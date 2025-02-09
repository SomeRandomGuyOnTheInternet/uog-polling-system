import { useState } from 'react';
import {
  VStack,
  Button,
  Input,
  FormControl,
  FormLabel,
  IconButton,
  HStack,
  Text,
  Divider,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

const API_URL = 'http://localhost:3001';

function JoinPoll({ onBack, onJoin, onError }) {
  const [joinCode, setJoinCode] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!joinCode.trim()) {
      onError('Please enter a join code');
      return;
    }

    setIsLoading(true);
    try {
      const headers = password ? { 'x-poll-password': password } : {};
      const response = await fetch(`${API_URL}/api/polls/${joinCode}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Invalid join code or password');
      }

      const pollData = await response.json();
      if (password && pollData.isCreator) {
        localStorage.setItem(`poll_${joinCode}_password`, password);
      }
      onJoin(pollData);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack spacing={4} align="center">
        <IconButton
          icon={<ArrowBackIcon />}
          onClick={onBack}
          aria-label="Go back"
          size="lg"
        />
        <Text fontSize="2xl" fontWeight="600">Join Poll</Text>
      </HStack>

      <VStack spacing={4}>
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="500">Enter Join Code</FormLabel>
          <Input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-digit code"
            maxLength={6}
            size="lg"
            textAlign="center"
            fontSize="28px"
            letterSpacing="0.5em"
            height="70px"
            fontWeight="600"
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="lg" fontWeight="500">Creator Password (Optional)</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to manage poll"
            size="lg"
          />
        </FormControl>
      </VStack>

      <Button
        onClick={handleSubmit}
        colorScheme="green"
        size="lg"
        height="60px"
        fontSize="lg"
        isLoading={isLoading}
      >
        Join Poll
      </Button>
    </VStack>
  );
}

export default JoinPoll;
