import React, { useState, useMemo, useEffect, useCallback } from 'react'; // Added useCallback
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, MessageSquare, Users, AlertTriangle, Loader2 } from 'lucide-react'; // Added AlertTriangle, Loader2
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/Contexts/AuthContext'; // Import useAuth



export default function MessagingPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth(); // Get currentUser
  const userPoliceStationId = currentUser?.policeStationId; // Get user's police station ID

  const [searchTerm, setSearchTerm] = useState('');
  const [policeStations, setPoliceStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [allMessages, setAllMessages] = useState({}); // Initialize as empty object
  const [loadingStations, setLoadingStations] = useState(true);
  const [errorStations, setErrorStations] = useState(null);
  
  const [loadingMessages, setLoadingMessages] = useState(false); // For loading messages of a selected station
  const [errorMessages, setErrorMessages] = useState(null); // For errors when fetching messages

  // const defaultId = 'PS00001'; // Replaced by userPoliceStationId from useAuth

  useEffect(() => {
    const fetchPoliceStations = async () => {
      setLoadingStations(true);
      setErrorStations(null);

      if (!userPoliceStationId) {
        setPoliceStations([]);
        setLoadingStations(false);
        console.log("User police station ID not available, cannot fetch/filter police stations.");
        return;
      }

      try {
        const response = await fetch('http://localhost:3004/api/police/root/get-all-police-station');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {          
          const filteredApiStations = result.data.filter(
            station => station.policeStationId !== userPoliceStationId // Use userPoliceStationId
          );

          // Fetch unread counts for each station
          const stationsWithUnreadCountsPromises = filteredApiStations.map(async (station) => {
            let unreadCount = 0;
            try {
              console.log(`Fetching unread count for user: ${userPoliceStationId}, other station: ${station.policeStationId}`);
              const unreadResponse = await fetch(`http://localhost:3004/api/message/getUnReadedMessagesNumber/${userPoliceStationId}/${station.policeStationId}`);
              console.log(`Unread response status for station ${station.policeStationId} (against user ${userPoliceStationId}): ${unreadResponse.status}`);

              if (unreadResponse.ok) {
                const unreadResult = await unreadResponse.json();
                console.log(`Unread result for station ${station.policeStationId}:`, unreadResult);

                if (unreadResult.success && typeof unreadResult.unreadCount === 'number') {
                  unreadCount = unreadResult.unreadCount;
                  console.log(`Assigned unreadCount ${unreadCount} to station ${station.policeStationId}`);
                } else {
                  console.warn(`Unread count not found or invalid in response for station ${station.policeStationId}. Success: ${unreadResult.success}, Count: ${unreadResult.unreadCount}`);
                }
              } else {
                const errorBody = await unreadResponse.text();
                console.warn(`Failed to fetch unread count for station ${station.policeStationId}. Status: ${unreadResponse.status}. Body: ${errorBody}`);
              }
            } catch (error) {
              console.warn(`Error fetching unread count for station ${station.policeStationId}:`, error);
            }
            
            return {
              id: station.policeStationId,
              name: station.nameOfPoliceStation,
              avatar: station.policeStationLogo ? `http://localhost:3004/uploads/${station.policeStationLogo}` : 'https://placehold.co/40x40?text=PS',
              unreadCount: unreadCount,
            };
          });

          const formattedStations = await Promise.all(stationsWithUnreadCountsPromises);
          console.log("Formatted stations with unread counts (before setting state):", JSON.parse(JSON.stringify(formattedStations)));

          setPoliceStations(formattedStations);
        } else {
          throw new Error('Failed to fetch stations or data format is incorrect.');
        }
      } catch (error) {
        console.error("Error fetching police stations:", error);
        setErrorStations(error.message);
        setPoliceStations([]); // Clear stations on error
      } finally {
        setLoadingStations(false);
      }
    };

    fetchPoliceStations();
  }, [userPoliceStationId]); // Depend on userPoliceStationId

  // Effect to fetch messages when a station is selected
  useEffect(() => {
    if (!selectedStationId || !userPoliceStationId) { // Check for userPoliceStationId
      // Optionally clear messages for the previously selected station or handle as needed
      // For now, we just don't fetch if no station is selected.
      // If selectedStationId is present but userPoliceStationId is not, clear messages for that station
      if (selectedStationId) {
        setAllMessages(prevMessages => ({ ...prevMessages, [selectedStationId]: [] }));
      }
      return;
    }

    const fetchMessagesForStation = async () => {
      setLoadingMessages(true);
      setErrorMessages(null);
      try {        
        const response = await fetch(`http://localhost:3004/api/message/getMessages/${userPoliceStationId}/${selectedStationId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const formattedApiMessages = result.data.map(apiMsg => ({
            id: apiMsg.messageId,
            text: apiMsg.content,
            // Format timestamp, or use as is if backend provides a good format
            timestamp: new Date(apiMsg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: apiMsg.senderStation.id === userPoliceStationId ? 'user' : 'station',
            stationName: apiMsg.senderStation.id !== userPoliceStationId ? apiMsg.senderStation.name : undefined,
            // Keep original sender/receiver if needed for other logic, e.g., message deletion rights
            originalSenderId: apiMsg.senderStation.id, 
            originalReceiverId: apiMsg.receiverStation.id,
          }));
          
          setAllMessages(prevMessages => ({
            ...prevMessages,
            [selectedStationId]: formattedApiMessages,
          }));
        } else {
          throw new Error(result.error || 'Failed to fetch messages or data format is incorrect.');
        }
      } catch (error) {
        console.error(`Error fetching messages for station ${selectedStationId}:`, error);
        setErrorMessages(error.message);
        setAllMessages(prevMessages => ({ // Clear messages for this station on error
          ...prevMessages,
          [selectedStationId]: [],
        }));
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessagesForStation();
  }, [selectedStationId, userPoliceStationId]); // Depend on userPoliceStationId

  const filteredStations = useMemo(() => {
    if (!searchTerm) return policeStations;
    return policeStations.filter(station =>
      station.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, policeStations]);

  const currentMessages = useMemo(() => {
    if (!selectedStationId) return [];
    return allMessages[selectedStationId] || [];
  }, [selectedStationId, allMessages]);

  const selectedStation = useMemo(() => {
    if (!selectedStationId) return null;
    return policeStations.find(s => s.id === selectedStationId);
  }, [selectedStationId, policeStations]);

  const handleStationSelect = useCallback(async (stationId) => {
    setSelectedStationId(stationId);
    setNewMessage('');
    // Messages will be fetched by the useEffect hook listening to selectedStationId

    // Optimistically update the unread count in the UI
    setPoliceStations(prevStations =>
      prevStations.map(station =>
        station.id === stationId ? { ...station, unreadCount: 0 } : station
      )
    );

    // Send request to mark messages as read
    if (userPoliceStationId && stationId) {
      try {
        console.log(`Marking messages as read between sender: ${stationId} and receiver: ${userPoliceStationId}`);
        const response = await fetch(`http://localhost:3004/api/message/readMessage/${stationId}/${userPoliceStationId}`, {
          method: 'GET', // Explicitly GET, though it's default
        });
        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`Failed to mark messages as read for station ${stationId}. Status: ${response.status}. Body: ${errorBody}`);
          // Optionally, revert optimistic update or show an error to the user
        } else {
          console.log(`Successfully marked messages as read for station ${stationId}`);
        }
      } catch (error) {
        console.error(`Error calling readMessage API for station ${stationId}:`, error);
      }
    }
  }, [userPoliceStationId]); // Added userPoliceStationId as a dependency

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedStationId || !userPoliceStationId) {
        console.warn("Cannot send message: new message, selected station, or user's station ID is missing.");
        return;
    }

    const newMsgObject = {
      id: `msg${Date.now()}`, // Temporary ID, backend should provide actual ID
      sender: 'user', // 'user' represents messages from userPoliceStationId
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stationName: undefined, // Not needed for 'user' (userPoliceStationId) messages
      originalSenderId: userPoliceStationId,
      originalReceiverId: selectedStationId,
    };

    setAllMessages(prevMessages => {
      if (!selectedStationId) return prevMessages; // Should not happen due to guard clause above
      const stationMsgs = prevMessages[selectedStationId] ? [...prevMessages[selectedStationId]] : [];
      stationMsgs.push(newMsgObject);
      return {
        ...prevMessages,
        [selectedStationId]: stationMsgs,
      };
    });
    setNewMessage('');

    const sendMessageToServer = async () => {
      if (!userPoliceStationId || !selectedStationId) { // Defensive check
        console.error("Cannot send message to server: User or receiver station ID is missing.");
        // TODO: Revert optimistic update or show error
        return;
      }
      try {
        const response = await fetch('http://localhost:3004/api/message/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: userPoliceStationId,
            receiverId: selectedStationId,
            message: newMessage,
          }),
        });
        if (!response.ok) throw new Error('Failed to send message');
        const savedMessage = await response.json();
        // TODO: Update allMessages with the actual saved message from backend
        // This might involve re-fetching or smarter updates to replace the temporary ID.
        console.log("Message sent and saved:", savedMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        // TODO: Handle send error (e.g., show a toast, revert optimistic update)
      }
    };
    sendMessageToServer();
  };

  // Effect to scroll to the bottom of messages when new messages are added or station changes
  useEffect(() => {
    const scrollArea = document.getElementById('message-scroll-area');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
      // A slight delay can help ensure rendering is complete before scrolling
      setTimeout(() => {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }, 0);
    }
  }, [currentMessages]); // Also consider selectedStationId if clearing messages causes scroll issues

 
  const renderMessages = () => {
    if (loadingMessages) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('loadingMessages', 'Loading messages...')}</p>
        </div>
      );
    }
    if (errorMessages) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-500 dark:text-red-400">{t('errorLoadingMessages', 'Error loading messages:')}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{errorMessages}</p>
          {/* Optionally, a retry button could be added here */}
        </div>
      );
    }
    if (currentMessages.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
          <MessageSquare className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('noMessagesYet', 'No messages yet. Start a conversation!')}</p>
        </div>
      );
    }
    return (
      <ScrollArea id="message-scroll-area" className="flex-grow p-4 space-y-6"> {/* Increased space-y for more margin */}
        {currentMessages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
            <div className={`max-w-md lg:max-w-lg p-3 rounded-xl shadow ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'}`}>
              {msg.sender === 'station' && msg.stationName && (
                <p className="text-xs font-semibold mb-1 text-blue-400 dark:text-blue-300">{msg.stationName}</p>
              )}
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'} text-right`}>{msg.timestamp}</p>
            </div>
          </div>
        ))}
      </ScrollArea>
    );
  };

  // Handle loading state for currentUser or missing userPoliceStationId
  if (!currentUser) { // currentUser is still loading from useAuth
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] bg-gray-100 dark:bg-gray-900 items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">{t('loadingUserData', 'Loading user data...')}</p>
      </div>
    );
  }
  if (!userPoliceStationId) { // currentUser is loaded, but policeStationId is missing
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] bg-gray-100 dark:bg-gray-900 items-center justify-center p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('messagingUnavailableTitle', 'Messaging Unavailable')}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t('missingPoliceStationIdError', "Your police station ID is not configured. Please contact support.")}</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] bg-gray-100 dark:bg-gray-900"> {/* Adjust height based on your Layout's header/navbar */}
      {/* Sidebar */}
      <div className="w-1/3 min-w-[280px] max-w-[400px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
            {t('Police Stations Messaging Page', 'Police Stations')}
          </h2>
          <div className="relative mt-4">
            <Input
              type="search"
              placeholder={t('Search PoliceStation', 'Search stations...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
        <ScrollArea className="flex-grow">
          {loadingStations ? (
            <div className="p-4 text-center"><Loader2 className="h-6 w-6 text-blue-500 animate-spin inline-block" /> <span className="text-gray-500 dark:text-gray-400 ml-2">{t('loadingStations', 'Loading stations...')}</span></div>
          ) : errorStations ? (
            <div className="p-4 text-center text-red-500 dark:text-red-400"><AlertTriangle className="h-6 w-6 inline-block mr-2" />{t('errorLoadingStations', `Error: ${errorStations}`)}</div>
          ) : filteredStations.length > 0 ? (
            filteredStations.map(station => {
              // Ensure station and station.id are defined before rendering
              if (!station || typeof station.id === 'undefined') {
                console.warn('Skipping rendering of invalid station data:', station);
                return null;
              }
              return (
                <div
                  key={station.id}
                  onClick={() => handleStationSelect(station.id)}
                  className={`p-3 flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors
                            ${selectedStationId === station.id ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400' : 'border-l-4 border-transparent'}`}
                >
                  <div className="relative mr-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={station.avatar} alt={station.name || 'Station'} />
                      <AvatarFallback>{(station.name || 'PS').substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {station.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full z-10">
                        {station.unreadCount}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      {station.name || 'Unknown Station'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="p-4 text-center text-gray-500 dark:text-gray-400">{t('noStationsFound', 'No stations found.')}</p>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-800/50">
        {selectedStation ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center shadow-sm">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={selectedStation.avatar} alt={selectedStation.name} />
                <AvatarFallback>{selectedStation.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{selectedStation.name}</h2>
            </div>

            {/* Message display area */}
            {renderMessages()}

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <Input type="text" placeholder={t('typeYourMessagePlaceholder', 'Type your message...')} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-grow py-2 dark:bg-gray-700 dark:border-gray-600" />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim() || loadingMessages} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2">
                  {loadingMessages ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 mr-0 sm:mr-2" />}
                  <span className="hidden sm:inline">{loadingMessages ? t('sendingButton', 'Sending...') : t('sendButton', 'Send')}</span>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <MessageSquare className="h-24 w-24 text-gray-300 dark:text-gray-600 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">{t('welcomeToMessagingTitle', 'Welcome to Messaging')}</h2>
            <p className="text-gray-500 dark:text-gray-400">{t('selectStationToChatPrompt', 'Select a police station from the list to start chatting.')}</p>
          </div>
        )}
      </div>
    </div>
  );
}