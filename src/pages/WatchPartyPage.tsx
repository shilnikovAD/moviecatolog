import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMovieDetails } from '../features/movies/moviesSlice';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  addParticipant,
  removeParticipant,
  setPlaying,
  setCurrentTime,
  addMessage,
} from '../features/watchParty/watchPartySlice';
import { watchPartyService, WatchPartyService } from '../services/watchPartyService';
import { movieApi } from '../services/movieApi';
import { VideoPlayer } from '../components/VideoPlayer';
import styles from './WatchPartyPage.module.css';

export const WatchPartyPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { movieDetails, loading } = useAppSelector((state) => state.movies);
  const watchParty = useAppSelector((state) => state.watchParty);

  const [userName, setUserName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [userId] = useState(() => `user_${Math.random().toString(36).substring(2, 9)}`);
  const [youtubeKey, setYoutubeKey] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (id) {
      dispatch(fetchMovieDetails(Number(id)));

      // Загружаем трейлер
      movieApi.getMovieVideos(Number(id)).then((data) => {
        const trailer = data.results.find(
          (video) => video.type === 'Trailer' && video.site === 'YouTube'
        );
        if (trailer) {
          setYoutubeKey(trailer.key);
        }
      }).catch(console.error);
    }

    const roomFromUrl = searchParams.get('room');
    if (roomFromUrl) {
      setRoomIdInput(roomFromUrl);
    }
  }, [id, dispatch, searchParams]);

  useEffect(() => {
    if (!watchParty.connected) return;

    // Слушаем события от сервиса
    const handleJoin = (data: any) => {
      dispatch(addParticipant({
        id: data.userId,
        name: data.userName || 'Anonymous',
        isHost: false,
      }));

      dispatch(addMessage({
        id: `${Date.now()}_${Math.random()}`,
        userId: 'system',
        userName: 'System',
        message: `${data.userName || 'Someone'} joined the party`,
        timestamp: Date.now(),
      }));
    };

    const handleLeave = (data: any) => {
      dispatch(removeParticipant(data.userId));
      dispatch(addMessage({
        id: `${Date.now()}_${Math.random()}`,
        userId: 'system',
        userName: 'System',
        message: `${data.userName || 'Someone'} left the party`,
        timestamp: Date.now(),
      }));
    };

    const handlePlay = (data: any) => {
      dispatch(setPlaying(true));
      if (data.data?.currentTime !== undefined) {
        dispatch(setCurrentTime(data.data.currentTime));
      }
    };

    const handlePause = (data: any) => {
      dispatch(setPlaying(false));
      if (data.data?.currentTime !== undefined) {
        dispatch(setCurrentTime(data.data.currentTime));
      }
    };

    const handleSeek = (data: any) => {
      if (data.data?.currentTime !== undefined) {
        dispatch(setCurrentTime(data.data.currentTime));
      }
    };

    const handleChat = (data: any) => {
      dispatch(addMessage({
        id: `${Date.now()}_${Math.random()}`,
        userId: data.userId,
        userName: data.userName || 'Anonymous',
        message: data.data.message,
        timestamp: Date.now(),
      }));
    };

    watchPartyService.on('join', handleJoin);
    watchPartyService.on('leave', handleLeave);
    watchPartyService.on('play', handlePlay);
    watchPartyService.on('pause', handlePause);
    watchPartyService.on('seek', handleSeek);
    watchPartyService.on('chat', handleChat);

    return () => {
      watchPartyService.off('join', handleJoin);
      watchPartyService.off('leave', handleLeave);
      watchPartyService.off('play', handlePlay);
      watchPartyService.off('pause', handlePause);
      watchPartyService.off('seek', handleSeek);
      watchPartyService.off('chat', handleChat);
    };
  }, [watchParty.connected, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [watchParty.messages]);

  // Автоматическое обновление времени при воспроизведении (для демо-режима)
  useEffect(() => {
    if (watchParty.isPlaying && watchParty.roomId) {
      // Обновляем время каждые 100ms
      timeUpdateIntervalRef.current = setInterval(() => {
        const newTime = watchParty.currentTime + 0.1;
        dispatch(setCurrentTime(newTime));

        // Не отправляем каждое обновление времени, чтобы не засорять канал
        // YouTube API или обычное видео сами обновляют время
      }, 100);
    } else {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [watchParty.isPlaying, watchParty.currentTime, watchParty.roomId, dispatch]);

  const handleCreateRoom = async () => {
    if (!userName.trim() || !id) return;

    const roomId = WatchPartyService.generateRoomId();
    await watchPartyService.connect(roomId, userId, userName);

    dispatch(createRoom({
      roomId,
      movieId: Number(id),
      userId,
      userName,
    }));

    setIsSetup(true);
  };

  const handleJoinRoom = async () => {
    if (!userName.trim() || !roomIdInput.trim() || !id) return;

    await watchPartyService.connect(roomIdInput, userId, userName);

    dispatch(joinRoom({
      roomId: roomIdInput,
      movieId: Number(id),
      userId,
      userName,
    }));

    setIsSetup(true);
  };

  const handleLeave = () => {
    watchPartyService.disconnect();
    dispatch(leaveRoom());
    navigate(`/movie/${id}`);
  };

  const handlePlayPause = () => {
    if (!watchParty.roomId) return;

    if (watchParty.isPlaying) {
      watchPartyService.pause(watchParty.roomId, userId, watchParty.currentTime);
      dispatch(setPlaying(false));
    } else {
      watchPartyService.play(watchParty.roomId, userId, watchParty.currentTime);
      dispatch(setPlaying(true));
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !watchParty.roomId) return;

    watchPartyService.sendChat(watchParty.roomId, userId, userName, chatMessage);

    dispatch(addMessage({
      id: `${Date.now()}_${Math.random()}`,
      userId,
      userName,
      message: chatMessage,
      timestamp: Date.now(),
    }));

    setChatMessage('');
  };

  const handleCopyRoomId = () => {
    if (watchParty.roomId) {
      const url = `${window.location.origin}/watch-party/${id}?room=${watchParty.roomId}`;
      navigator.clipboard.writeText(url);
      alert('Room link copied to clipboard!');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className={styles.page}>Loading movie details...</div>;
  }

  if (!movieDetails) {
    return <div className={styles.page}>Movie not found</div>;
  }

  if (!isSetup) {
    return (
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate(`/movie/${id}`)}>
          ← Back to Movie
        </button>

        <div className={styles.setupSection}>
          <h1 className={styles.setupTitle}>Watch Party: {movieDetails.title}</h1>

          <div className={styles.setupOptions}>
            <div className={styles.inputGroup}>
              <label>Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
              />
            </div>

            <button className={styles.setupBtn} onClick={handleCreateRoom}>
              Create New Watch Party
            </button>

            <div className={styles.divider}>OR</div>

            <div className={styles.inputGroup}>
              <label>Room ID</label>
              <input
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="Enter room ID to join"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
            </div>

            <button className={styles.setupBtn} onClick={handleJoinRoom}>
              Join Watch Party
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={handleLeave}>
        ← Leave Watch Party
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>{movieDetails.title}</h1>
      </div>

      {watchParty.isHost && (
        <div className={styles.roomInfo}>
          <span>Room ID:</span>
          <span className={styles.roomId}>{watchParty.roomId}</span>
          <button className={styles.copyBtn} onClick={handleCopyRoomId}>
            Copy Link
          </button>
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.videoSection}>
          <VideoPlayer
            youtubeKey={youtubeKey}
            isPlaying={watchParty.isPlaying}
            currentTime={watchParty.currentTime}
            onPlayPause={handlePlayPause}
            onTimeUpdate={(time) => {
              if (watchParty.roomId) {
                dispatch(setCurrentTime(time));
              }
            }}
            onSeek={(time) => {
              if (watchParty.roomId) {
                watchPartyService.seek(watchParty.roomId, userId, time);
                dispatch(setCurrentTime(time));
              }
            }}
            title={movieDetails?.title}
          />
        </div>

        <div className={styles.sidebar}>
          <div className={styles.participants}>
            <h2 className={styles.sectionTitle}>
              Participants ({watchParty.participants.length})
            </h2>
            <div className={styles.participantsList}>
              {watchParty.participants.map((participant) => (
                <div key={participant.id} className={styles.participant}>
                  <span>👤 {participant.name}</span>
                  {participant.isHost && (
                    <span className={styles.hostBadge}>HOST</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.chat}>
            <h2 className={styles.sectionTitle}>Chat</h2>
            <div className={styles.messages}>
              {watchParty.messages.map((msg) => (
                <div key={msg.id} className={styles.message}>
                  <div className={styles.messageUser}>
                    {msg.userId === 'system' ? '🤖' : '👤'} {msg.userName}
                  </div>
                  <p className={styles.messageText}>{msg.message}</p>
                  <div className={styles.messageTime}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className={styles.chatInput}>
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

