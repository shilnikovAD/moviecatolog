# Watch Party Feature Guide

## Overview

The Watch Party feature allows multiple users to watch movie trailers together in perfect synchronization. Using the BroadcastChannel API, all viewers on the same computer can have their playback synchronized in real-time.

## How It Works

### Technology
- **BroadcastChannel API**: Enables communication between browser tabs/windows on the same origin
- **Session IDs**: Each participant gets a unique cryptographically secure session ID (crypto.randomUUID())
- **Message Types**: `play`, `pause`, `seek`, `join`, `leave`

### Synchronization
When any participant performs an action:
1. The action is broadcast to all other tabs via BroadcastChannel
2. Other participants receive the message and update their player state
3. Playback stays synchronized across all viewers

## Usage Instructions

### Starting a Watch Party

1. **Navigate to a Movie**
   - Browse the home page or use search to find a movie
   - Click on a movie card to view details

2. **Go to Watch Page**
   - Click the **"▶️ Watch"** button on a movie card, OR
   - Click **"▶️ Watch Now"** on the movie details page

3. **Start the Party**
   - On the watch page, click **"🎉 Start Watch Party"**
   - You'll be redirected to the watch party page

4. **Invite Others** (on the same computer)
   - Copy the watch party URL
   - Open it in other browser tabs or windows
   - All viewers will be synchronized automatically

### During the Watch Party

#### As a Viewer
- **Play/Pause**: Any viewer can play or pause, affecting everyone
- **Seek**: Jumping to a specific time syncs for all viewers
- **Participant Count**: See how many people are watching
- **Leave**: Simply close the tab to leave the party

#### What's Synchronized
- ✅ Play/Pause state
- ✅ Current playback time
- ✅ Seeking to different timestamps
- ✅ Participant joining/leaving

#### What's NOT Synchronized
- ❌ Volume levels (each viewer controls their own)
- ❌ Fullscreen mode (local to each viewer)

## Testing the Feature

### Single Computer Testing
1. Open the watch party URL in Tab 1
2. Open the same URL in Tab 2
3. Click play in Tab 1
4. Observe Tab 2 starts playing automatically
5. Seek in Tab 2
6. Observe Tab 1 jumps to the same position

### Participant Counter
- Each new tab increases the participant count
- Closing a tab decreases the count
- The count is displayed on the watch party page

## Technical Details

### Message Format
```typescript
interface SyncMessage {
  type: 'play' | 'pause' | 'seek';
  time?: number;
  senderId: string;
}
```

### Channel Naming
- Each movie has its own channel: `watch-party-${movieId}`
- This prevents cross-talk between different movies

### Session Management
- Each tab generates a unique session ID on load
- Messages are ignored if they come from the same session ID
- Prevents infinite loops and echo effects

## Limitations

### Current Limitations
1. **Same Computer Only**: BroadcastChannel API only works between tabs on the same machine
2. **Same Browser**: Doesn't work across different browsers (Chrome to Firefox, etc.)
3. **Video Content**: Only plays official trailers from TMDB, not full movies
4. **Network**: No network communication involved (completely local)

### For Cross-Device Synchronization
To enable watching across different computers, you would need:
- WebSocket server for real-time communication
- Server-side state management
- More complex synchronization logic
- Network latency handling

## Troubleshooting

### Sync Not Working?
1. Make sure you're using the same browser for all tabs
2. Verify both tabs are on the exact same URL
3. Check browser console for errors
4. Try refreshing all tabs

### Participant Count Wrong?
- This can happen if tabs are force-closed without cleanup
- Refresh the page to reset the count
- The count resets when the first viewer joins

### Video Not Playing?
- Check if the movie has available trailers on TMDB
- Some movies may not have YouTube trailers
- The player will show "Demo Mode" if no trailer is available

## Best Practices

### For the Best Experience
1. **Start Together**: Have all viewers join before starting playback
2. **One Leader**: Designate one person to control play/pause
3. **Communicate**: Use external chat/voice to coordinate
4. **Stable Connection**: Ensure all tabs remain open and active
5. **Same Quality**: All viewers see the same YouTube video quality

### Performance Tips
- Don't open too many tabs (10+ may cause lag)
- Close other resource-intensive applications
- Use a modern, up-to-date browser
- Ensure good YouTube video loading

## Future Enhancements

Potential improvements for the future:
- [ ] Chat functionality within watch party
- [ ] WebSocket support for cross-device sync
- [ ] Video quality selection
- [ ] Timestamp-based comments
- [ ] Leader/follower roles
- [ ] Private watch party rooms with codes
- [ ] Voice chat integration
- [ ] Watch history and stats

## API Reference

### VideoPlayer Props
```typescript
interface VideoPlayerProps {
  youtubeKey?: string;      // YouTube video ID
  videoUrl?: string;        // Alternative video URL
  isPlaying?: boolean;      // Playback state
  currentTime?: number;     // Current timestamp
  onPlayPause?: () => void; // Play/pause callback
  onTimeUpdate?: (time: number) => void; // Time update callback
  onSeek?: (time: number) => void;       // Seek callback
  title?: string;           // Video title
}
```

### BroadcastChannel Messages
```typescript
// Play
{ type: 'play', time: number, senderId: string }

// Pause
{ type: 'pause', time: number, senderId: string }

// Seek
{ type: 'seek', time: number, senderId: string }

// Join
{ type: 'join', senderId: string }

// Leave
{ type: 'leave', senderId: string }
```

## Security

### Implemented Security Measures
1. **YouTube Key Sanitization**: Only alphanumeric, underscore, and hyphen allowed
2. **Secure Session IDs**: Using crypto.randomUUID() for collision-free IDs
3. **XSS Prevention**: All user-controlled data is sanitized
4. **No External Data**: Watch party doesn't accept external data

### Privacy
- No data is sent to external servers
- All synchronization happens locally via BroadcastChannel
- No personal information is collected or transmitted
- Session IDs are temporary and not stored

## Support

For issues or questions:
1. Check this guide first
2. Look at the browser console for errors
3. Verify your browser supports BroadcastChannel API
4. Open an issue on GitHub with details

## License

This feature is part of MovieCatalog and is available under the MIT License.
