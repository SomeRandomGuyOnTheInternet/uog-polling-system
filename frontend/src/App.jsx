import { ChakraProvider, Container, VStack, Heading, Button, useToast, Image, HStack, Center, Text } from '@chakra-ui/react';
import { useState } from 'react';
import CreatePoll from './components/CreatePoll';
import JoinPoll from './components/JoinPoll';
import PollView from './components/PollView';

function App() {
  const [view, setView] = useState('home');
  const [currentPoll, setCurrentPoll] = useState(null);
  const toast = useToast();

  const handleError = (message) => {
    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  };

  const renderView = () => {
    switch (view) {
      case 'create':
        return <CreatePoll onBack={() => setView('home')} onError={handleError} />;
      case 'join':
        return (
          <JoinPoll
            onBack={() => setView('home')}
            onJoin={(poll) => {
              setCurrentPoll(poll);
              setView('poll');
            }}
            onError={handleError}
          />
        );
      case 'poll':
        return (
          <PollView
            poll={currentPoll}
            onBack={() => {
              setCurrentPoll(null);
              setView('home');
            }}
            onError={handleError}
          />
        );
      default:
        return (
          <HStack spacing={8} justify="center" align="center">
            <Button size="lg" colorScheme="blue" width="200px" onClick={() => setView('create')}>
              Create Poll
            </Button>
            <Text color="gray.500" fontWeight="medium">
              — or —
            </Text>
            <Button size="lg" colorScheme="green" width="200px" onClick={() => setView('join')}>
              Join Poll
            </Button>
          </HStack>
        );
    }
  };

  return (
    <ChakraProvider>
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          <Center mb={8}>
            <HStack spacing={4} align="center">
              <Image src="/uog-logo.png" alt="UoG Logo" height="50px" />
              <Heading size="xl">
                UoG Polling System
              </Heading>
            </HStack>
          </Center>
          {renderView()}
        </VStack>
      </Container>
    </ChakraProvider>
  );
}

export default App;
