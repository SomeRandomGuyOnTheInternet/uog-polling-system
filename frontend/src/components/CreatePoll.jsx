import { useState } from "react";
import {
  VStack,
  Button,
  Input,
  FormControl,
  FormLabel,
  IconButton,
  HStack,
  Box,
  Text,
  Checkbox,
  useToast,
  Divider,
} from "@chakra-ui/react";
import {
  AddIcon,
  DeleteIcon,
  ArrowBackIcon,
  CloseIcon,
} from "@chakra-ui/icons";

// Use window.location.origin to dynamically determine the backend URL
const API_URL = window.location.origin;

function CreatePoll({ onBack, onError }) {
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [questions, setQuestions] = useState([
    {
      text: "",
      options: [{ text: "", isCorrect: false }],
    },
  ]);
  const toast = useToast();

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: [{ text: "", isCorrect: false }],
      },
    ]);
  };

  const handleRemoveQuestion = (questionIndex) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== questionIndex));
    }
  };

  const handleQuestionTextChange = (questionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].text = value;
    setQuestions(newQuestions);
  };

  const handleAddOption = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push({ text: "", isCorrect: false });
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options.length > 1) {
      newQuestions[questionIndex].options = newQuestions[
        questionIndex
      ].options.filter((_, i) => i !== optionIndex);
      setQuestions(newQuestions);
    }
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex].text = value;
    setQuestions(newQuestions);
  };

  const handleCorrectChange = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex].isCorrect =
      !newQuestions[questionIndex].options[optionIndex].isCorrect;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      onError("Please enter a poll title");
      return;
    }

    if (!password.trim()) {
      onError("Please enter a password");
      return;
    }

    if (questions.some((q) => !q.text.trim())) {
      onError("Please fill in all question texts");
      return;
    }

    if (questions.some((q) => q.options.length < 2)) {
      onError("Each question must have at least two options");
      return;
    }

    if (questions.some((q) => q.options.some((opt) => !opt.text.trim()))) {
      onError("Please fill in all options");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/polls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          questions,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create poll");
      }

      const data = await response.json();
      toast({
        title: "Poll Created!",
        description: `Join code: ${data.joinCode}`,
        status: "success",
        duration: null,
        isClosable: true,
      });
      onBack();
    } catch (error) {
      onError(error.message);
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
        <Text fontSize="2xl" fontWeight="600">
          Create New Poll
        </Text>
      </HStack>

      <VStack spacing={4}>
        <FormControl>
          <FormLabel fontSize="lg" fontWeight="500">
            Poll Title
          </FormLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter poll title"
            size="lg"
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="lg" fontWeight="500">
            Creator Password
          </FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to manage poll"
            size="lg"
          />
        </FormControl>
      </VStack>

      {questions.map((question, questionIndex) => (
        <Box key={questionIndex} p={4} borderWidth={1} borderRadius="lg">
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <FormControl>
                <HStack justify="space-between">
                  <FormLabel fontSize="lg" fontWeight="500">
                    Question {questionIndex + 1}
                  </FormLabel>
                  {questions.length > 1 && (
                    <IconButton
                      icon={<DeleteIcon />}
                      onClick={() => handleRemoveQuestion(questionIndex)}
                      aria-label="Remove question"
                      variant="ghost"
                      colorScheme="red"
                      alignSelf="flex-end"
                    />
                  )}
                </HStack>
                <Input
                  value={question.text}
                  onChange={(e) =>
                    handleQuestionTextChange(questionIndex, e.target.value)
                  }
                  placeholder="Enter your question"
                  size="lg"
                />
              </FormControl>
            </HStack>

            <VStack spacing={4} align="stretch">
              {question.options.map((option, optionIndex) => (
                <HStack key={optionIndex}>
                  {question.options.length > 1 && (
                    <IconButton
                      icon={<CloseIcon />}
                      onClick={() =>
                        handleRemoveOption(questionIndex, optionIndex)
                      }
                      aria-label="Remove option"
                      variant="ghost"
                      colorScheme="red"
                    />
                  )}
                  <Input
                    value={option.text}
                    onChange={(e) =>
                      handleOptionChange(
                        questionIndex,
                        optionIndex,
                        e.target.value
                      )
                    }
                    placeholder={`Option ${optionIndex + 1}`}
                    size="lg"
                  />
                  <Checkbox
                    isChecked={option.isCorrect}
                    onChange={() =>
                      handleCorrectChange(questionIndex, optionIndex)
                    }
                  >
                    Correct
                  </Checkbox>
                </HStack>
              ))}
            </VStack>

            <Button
              leftIcon={<AddIcon />}
              onClick={() => handleAddOption(questionIndex)}
              colorScheme="blue"
              variant="ghost"
              alignSelf="flex-start"
            >
              Add Option
            </Button>
          </VStack>
        </Box>
      ))}

      <Button
        leftIcon={<AddIcon />}
        onClick={handleAddQuestion}
        colorScheme="blue"
        variant="outline"
      >
        Add Question
      </Button>

      <Button onClick={handleSubmit} colorScheme="green" size="lg">
        Create Poll
      </Button>
    </VStack>
  );
}

export default CreatePoll;
