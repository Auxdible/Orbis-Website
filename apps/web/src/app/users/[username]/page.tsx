'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Badge {
    id: string;
    awardedAt: string;
    badge: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        icon: string | null;
        color: string | null;
        rarity: string;
    };
}

interface TeamMembership {
    id: string;
    role: string;
    joinedAt: string;
    team: {
        id: string;
        name: string;
        displayName: string;
        logo: string | null;
    };
}

interface Resource {
    id: string;
    name: string;
    slug: string;
    tagline: string;
    iconUrl: string | null;
    type: string;
    status: string;
    downloadCount: number;
    likeCount: number;
    createdAt: string;
    updatedAt: string;
}

interface Server {
    id: string;
    name: string;
    slug: string;
    shortDesc: string | null;
    logo: string | null;
    serverIp: string;
    port: number;
    status: string;
    isOnline: boolean;
    currentPlayers: number;
    maxPlayers: number;
    createdAt: string;
}

interface UserProfile {
    id: string;
    username: string;
    displayName: string | null;
    image: string | null;
    banner: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    role: string;
    status: string;
    reputation: number;
    showEmail: boolean;
    showLocation: boolean;
    showOnlineStatus: boolean;
    createdAt: string;
    lastActiveAt: string | null;
    _count: {
        followers: number;
        following: number;
        ownedResources: number;
        ownedServers: number;
    };
    userBadges: Badge[];
    teamMemberships: TeamMembership[];
    ownedResources: Resource[];
    ownedServers: Server[];
}

type TabType = 'overview' | 'resources' | 'servers';

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const username = params.username as string;
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/users/username/${username}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('User not found');
                    } else {
                        setError('Failed to load user profile');
                    }
                    return;
                }

                const data = await response.json();
                setUser(data);
            } catch (err) {
                console.error('Error fetching user:', err);
                setError('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        }

        if (username) {
            fetchUserProfile();
        }
    }, [username]);

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Icon icon="mdi:loading" className="animate-spin text-primary" width="40" height="40" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Icon icon="mdi:account-alert" className="text-muted-foreground mx-auto mb-4" width="64" height="64" />
                    <h1 className="font-hebden text-2xl font-bold mb-2">{error || 'User not found'}</h1>
                    <p className="text-muted-foreground font-nunito mb-4">The user doesn't exist.</p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: 'mdi:view-dashboard' },
        { id: 'resources' as TabType, label: 'Resources', icon: 'mdi:package-variant', count: user._count.ownedResources },
        { id: 'servers' as TabType, label: 'Servers', icon: 'mdi:server', count: user._count.ownedServers },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Compact Header */}
            <div className="border-b border-foreground/10 bg-secondary/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Banner */}
                    <div
                        className="h-48 -mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden"
                        style={user.banner ? {
                            backgroundImage: `url(${user.banner})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        } : {
                            background: 'linear-gradient(135deg, rgba(var(--primary), 0.1) 0%, rgba(var(--secondary), 0.1) 100%)'
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
                    </div>

                    {/* Profile Info */}
                    <div className="pb-4 relative">
                        {/* Avatar - Overlaps Banner */}
                        <div className="-mt-12 mb-4 px-4 sm:px-0">
                            <div className="relative inline-block">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                                    <AvatarImage src={user.image || undefined} alt={user.displayName || user.username} />
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-hebden text-2xl">
                                        {getInitials(user.displayName || user.username)}
                                    </AvatarFallback>
                                </Avatar>
                                {user.showOnlineStatus && (
                                    <div className="absolute bottom-1 right-1 h-4 w-4 bg-green-500 rounded-full border-3 border-background" />
                                )}
                            </div>
                        </div>

                        {/* Follow Button - Positioned on right */}
                        <div className="absolute top-18 right-0">
                            <Button
                                onClick={() => setIsFollowing(!isFollowing)}
                                variant={isFollowing ? "outline" : "default"}
                                size="sm"
                                className="font-hebden"
                            >
                                <Icon icon={isFollowing ? "mdi:account-check" : "mdi:account-plus"} width="18" height="18" />
                                {isFollowing ? 'Following' : 'Follow'}
                            </Button>
                        </div>

                        {/* Info & Stats - Below Banner */}
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="font-hebden text-2xl font-bold truncate">{user.displayName || user.username}</h1>
                                {user.role !== 'USER' && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/20 text-primary">
                                        {user.role}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-nunito">
                                <span>@{user.username}</span>
                                <span className="flex items-center gap-1">
                                    <Icon icon="mdi:calendar" width="14" height="14" />
                                    {formatDate(user.createdAt)}
                                </span>
                                {user.showLocation && user.location && (
                                    <span className="flex items-center gap-1">
                                        <Icon icon="mdi:map-marker" width="14" height="14" />
                                        {user.location}
                                    </span>
                                )}
                                {user.website && (
                                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                        <Icon icon="mdi:link" width="14" height="14" />
                                        Website
                                    </a>
                                )}
                            </div>

                            {/* Inline Stats */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Icon icon="mdi:account-group" width="16" height="16" className="text-muted-foreground" />
                                    <span className="font-semibold text-foreground">{user._count.followers}</span>
                                    <span className="text-muted-foreground">followers</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Icon icon="mdi:account-multiple" width="16" height="16" className="text-muted-foreground" />
                                    <span className="font-semibold text-foreground">{user._count.following}</span>
                                    <span className="text-muted-foreground">following</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Icon icon="mdi:star" width="16" height="16" className="text-primary" />
                                    <span className="font-semibold text-foreground">{user.reputation}</span>
                                    <span className="text-muted-foreground">reputation</span>
                                </div>
                            </div>
                        </div>

                        {/* Bio - Compact */}
                        {user.bio && (
                            <div className="mt-4 text-sm text-foreground/90 font-nunito max-w-3xl">
                                {user.bio}
                            </div>
                        )}

                        {/* Tabs Navigation */}
                        <div className="flex gap-1 mt-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    relative px-4 py-3 font-hebden text-sm whitespace-nowrap transition-colors flex items-center gap-2
                    ${activeTab === tab.id
                                            ? 'text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                        }
                  `}
                                >
                                    <Icon icon={tab.icon} width="18" height="18" />
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary/20 text-primary font-nunito">
                                            {tab.count}
                                        </span>
                                    )}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Pinned Resources */}
                            <div className="border border-foreground/10 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-hebden text-lg font-semibold flex items-center gap-2">
                                        <Icon icon="mdi:pin" width="20" height="20" className="text-primary" />
                                        Pinned Resources
                                    </h3>
                                    <button className="text-sm text-primary hover:underline font-nunito">View all</button>
                                </div>
                                <div className="text-center py-12 text-muted-foreground">
                                    <Icon icon="mdi:package-variant-closed" width="48" height="48" className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm font-nunito">No pinned resources</p>
                                </div>
                            </div>

                            {/* Teams */}
                            <div className="border border-foreground/10 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-hebden text-lg font-semibold flex items-center gap-2">
                                        <Icon icon="mdi:office-building" width="20" height="20" className="text-primary" />
                                        Teams
                                    </h3>
                                    {user.teamMemberships.length > 0 && (
                                        <span className="text-sm text-muted-foreground font-nunito">{user.teamMemberships.length}</span>
                                    )}
                                </div>
                                {user.teamMemberships.length > 0 ? (
                                    <div className="flex flex-wrap gap-3">
                                        {user.teamMemberships.map((membership) => (
                                            <Link
                                                key={membership.id}
                                                href={`/teams/${membership.team.name}`}
                                                className="group flex items-center gap-3 px-4 py-3 border border-foreground/10 rounded-lg hover:border-primary/30 hover:bg-secondary/30 transition-all"
                                            >
                                                <Avatar className="h-10 w-10 border-2 border-foreground/10">
                                                    <AvatarImage src={membership.team.logo || undefined} alt={membership.team.displayName} />
                                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground font-hebden text-sm">
                                                        {getInitials(membership.team.displayName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-hebden text-sm font-medium group-hover:text-primary transition-colors truncate">
                                                        {membership.team.displayName}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground font-nunito">
                                                        {membership.role}
                                                    </div>
                                                </div>
                                                <Icon
                                                    icon="mdi:chevron-right"
                                                    width="20"
                                                    height="20"
                                                    className="text-muted-foreground group-hover:text-primary transition-colors"
                                                />
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Icon icon="mdi:account-group-outline" width="40" height="40" className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm font-nunito">Not a member of any teams</p>
                                    </div>
                                )}
                            </div>

                            {/* Recent Activity */}
                            <div className="border border-foreground/10 rounded-lg p-6">
                                <h3 className="font-hebden text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:clock-outline" width="20" height="20" className="text-primary" />
                                    Recent Activity
                                </h3>
                                <div className="text-center py-8 text-muted-foreground">
                                    <Icon icon="mdi:history" width="40" height="40" className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm font-nunito">No recent activity</p>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">


                            {/* Quick Stats */}
                            <div className="border border-foreground/10 rounded-lg p-5">
                                <h3 className="font-hebden text-base font-semibold mb-4">Quick Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground font-nunito">Total Downloads</span>
                                        <span className="font-semibold">0</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground font-nunito">Total Likes</span>
                                        <span className="font-semibold">0</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground font-nunito">Member Since</span>
                                        <span className="font-semibold">{formatDate(user.createdAt)}</span>
                                    </div>
                                    {user.lastActiveAt && user.showOnlineStatus && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground font-nunito">Last Active</span>
                                            <span className="font-semibold">{formatDate(user.lastActiveAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="border border-foreground/10 rounded-lg p-5">
                                <h3 className="font-hebden text-base font-semibold mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:trophy-variant" width="18" height="18" className="text-primary" />
                                    Badges ({user.userBadges.length})
                                </h3>
                                {user.userBadges.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-2">
                                        {user.userBadges.slice(0, 8).map((userBadge) => (
                                            <div
                                                key={userBadge.id}
                                                className="aspect-square rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors flex items-center justify-center cursor-pointer group relative"
                                                title={userBadge.badge.name}
                                            >
                                                {userBadge.badge.icon ? (
                                                    <img src={userBadge.badge.icon} alt={userBadge.badge.name} className="w-8 h-8" />
                                                ) : (
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center"
                                                        style={{ backgroundColor: userBadge.badge.color || '#69a024' }}
                                                    >
                                                        <Icon icon="mdi:trophy" width="16" height="16" className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <Icon icon="mdi:trophy-outline" width="32" height="32" className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm font-nunito">No badges yet</p>
                                    </div>
                                )}
                                {user.userBadges.length > 8 && (
                                    <button className="text-sm text-primary hover:underline font-nunito mt-3 w-full text-center">
                                        View all {user.userBadges.length} badges
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                )}

                {/* Resources Tab */}
                {activeTab === 'resources' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-hebden text-xl font-semibold">Resources ({user._count.ownedResources})</h2>
                            <div className="flex gap-2">
                                <select className="px-3 py-1.5 text-sm rounded-lg border border-foreground/10 bg-background font-nunito">
                                    <option>All Types</option>
                                    <option>Plugins</option>
                                    <option>Mods</option>
                                    <option>Asset Packs</option>
                                </select>
                                <select className="px-3 py-1.5 text-sm rounded-lg border border-foreground/10 bg-background font-nunito">
                                    <option>Latest</option>
                                    <option>Most Downloaded</option>
                                    <option>Most Liked</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {user.ownedResources.length > 0 ? (
                                user.ownedResources.map((resource) => (
                                    <a
                                        key={resource.id}
                                        href={`/marketplace/${resource.slug}`}
                                        className="border border-foreground/10 rounded-lg p-4 hover:border-primary/30 hover:bg-secondary/30 transition-all"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="h-12 w-12 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {resource.iconUrl ? (
                                                    <img src={resource.iconUrl} alt={resource.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Icon icon="mdi:package-variant" width="24" height="24" className="text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-hebden font-medium truncate">{resource.name}</h3>
                                                <p className="text-xs text-muted-foreground">{resource.type.replace(/_/g, ' ')}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground font-nunito line-clamp-2 mb-3">
                                            {resource.tagline}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Icon icon="mdi:download" width="14" height="14" />
                                                {resource.downloadCount}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Icon icon="mdi:heart" width="14" height="14" />
                                                {resource.likeCount}
                                            </span>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-16 border border-dashed border-foreground/10 rounded-lg">
                                    <Icon icon="mdi:package-variant-closed" width="64" height="64" className="mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <h3 className="font-hebden text-lg font-semibold mb-2">No resources yet</h3>
                                    <p className="text-sm text-muted-foreground font-nunito">
                                        This user hasn't published any resources.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Servers Tab */}
                {activeTab === 'servers' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-hebden text-xl font-semibold">Servers ({user._count.ownedServers})</h2>
                            <select className="px-3 py-1.5 text-sm rounded-lg border border-foreground/10 bg-background font-nunito">
                                <option>All Status</option>
                                <option>Online</option>
                                <option>Offline</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.ownedServers.length > 0 ? (
                                user.ownedServers.map((server) => (
                                    <a
                                        key={server.id}
                                        href={`/servers/${server.slug}`}
                                        className="border border-foreground/10 rounded-lg p-4 hover:border-primary/30 hover:bg-secondary/30 transition-all"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="h-12 w-12 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {server.logo ? (
                                                    <img src={server.logo} alt={server.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Icon icon="mdi:server" width="24" height="24" className="text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-hebden font-medium truncate">{server.name}</h3>
                                                    {server.isOnline && (
                                                        <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{server.serverIp}:{server.port}</p>
                                            </div>
                                        </div>
                                        {server.shortDesc && (
                                            <p className="text-sm text-muted-foreground font-nunito line-clamp-2 mb-3">
                                                {server.shortDesc}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-4 text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Icon icon="mdi:account" width="14" height="14" />
                                                    {server.currentPlayers}/{server.maxPlayers}
                                                </span>
                                                <span className={server.isOnline ? 'text-green-500' : 'text-red-500'}>
                                                    {server.isOnline ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-16 border border-dashed border-foreground/10 rounded-lg">
                                    <Icon icon="mdi:server-off" width="64" height="64" className="mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <h3 className="font-hebden text-lg font-semibold mb-2">No servers</h3>
                                    <p className="text-sm text-muted-foreground font-nunito">
                                        This user doesn't own any servers.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
