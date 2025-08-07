'use client'
import {
    ControlBar,
    GridLayout,
    ParticipantTile,
    RoomAudioRenderer,
    useTracks,
    RoomContext,
} from '@livekit/components-react';
import { Room, Track } from 'livekit-client';
import '@livekit/components-styles';
import {useEffect, useState} from 'react';

const serverUrl = 'ws://localhost:7880'

interface JoinFormProps {
    onJoin: (roomId: string, username: string) => void;
    loading: boolean;
}

function JoinForm({ onJoin, loading }: JoinFormProps) {
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomId.trim() && username.trim()) {
            onJoin(roomId.trim(), username.trim());
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Join Meeting
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your details to join the video conference
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                                Room ID
                            </label>
                            <input
                                id="roomId"
                                name="roomId"
                                type="text"
                                required
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Enter room ID"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Enter your username"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || !roomId.trim() || !username.trim()}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Joining...' : 'Join Meeting'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Home() {
    const [room] = useState(() => new Room({
        // Optimize video quality for each participant's screen
        adaptiveStream: true,
        // Enable automatic audio/video quality optimization
        dynacast: true,
    }));

    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoin = async (roomId: string, username: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomId, username }),
            });

            if (!response.ok) {
                throw new Error('Failed to get token');
            }

            const data = await response.json();
            setToken(data.token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to join meeting');
            setLoading(false);
        }
    };

    // Connect to room when token is available
    useEffect(() => {
        if (!token) return;

        let mounted = true;

        const connect = async () => {
            if (mounted) {
                try {
                    await room.connect(serverUrl, token);
                    setLoading(false);
                } catch (err) {
                    setError('Failed to connect to room');
                    setLoading(false);
                }
            }
        };
        connect();

        return () => {
            mounted = false;
            room.disconnect();
        };
    }, [room, token]);

    // Show form if no token
    if (!token) {
        return (
            <div>
                <JoinForm onJoin={handleJoin} loading={loading} />
                {error && (
                    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}
            </div>
        );
    }

    // Show meeting interface when connected
    return (
        <RoomContext.Provider value={room}>
            <div data-lk-theme="default" style={{ height: '100vh' }}>
                {/* Your custom component with basic video conferencing functionality. */}
                <MyVideoConference />
                {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
                <RoomAudioRenderer />
                {/* Controls for the user to start/stop audio, video, and screen share tracks */}
                <ControlBar />
            </div>
        </RoomContext.Provider>
    );
}
function MyVideoConference() {
    // `useTracks` returns all camera and screen share tracks. If a user
    // joins without a published camera track, a placeholder track is returned.
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false },
    );
    return (
        <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
            {/* The GridLayout accepts zero or one child. The child is used
      as a template to render all passed in tracks. */}
            <ParticipantTile />
        </GridLayout>
    );
}
