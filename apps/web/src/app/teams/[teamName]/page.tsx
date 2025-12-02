'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify-icon/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface TeamMember {
    id: string;
    username: string;
    displayName: string | null;
    image: string | null;
    role: string;
    joinedAt: string;
    user: {
        id: string;
        username: string;
        displayName: string | null;
        image: string | null;
    };
}

interface TeamProfile {
    id: string;
    name: string;
    displayName: string;
    description: string | null;
    logo: string | null;
    banner: string | null;
    website: string | null;
    discordUrl: string | null;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    owner: {
        id: string;
        username: string;
        displayName: string | null;
        image: string | null;
    };
    members: TeamMember[];
}

type TabType = 'overview' | 'resources' | 'servers' | 'members';

export default function TeamPage() {
    const params = useParams();
    const router = useRouter();
    const teamName = params.teamName as string;
    const [team, setTeam] = useState<TeamProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    useEffect(() => {
        async function fetchTeamProfile() {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/teams/${teamName}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Team not found');
                    } else {
                        setError('Failed to load team');
                    }
                    return;
                }

                const data = await response.json();
                setTeam(data);
            } catch (err) {
                console.error('Error fetching team:', err);
                setError('Failed to load team');
            } finally {
                setLoading(false);
            }
        }

        if (teamName) {
            fetchTeamProfile();
        }
    }, [teamName]);

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

    if (error || !team) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Icon icon="mdi:account-group-outline" className="text-muted-foreground mx-auto mb-4" width="64" height="64" />
                    <h1 className="font-hebden text-2xl font-bold mb-2">{error || 'Team not found'}</h1>
                    <p className="text-muted-foreground font-nunito mb-4">This team doesn't exist.</p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: 'mdi:view-dashboard' },
        { id: 'resources' as TabType, label: 'Resources', icon: 'mdi:package-variant', count: 0 },
        { id: 'servers' as TabType, label: 'Servers', icon: 'mdi:server', count: 0 },
        { id: 'members' as TabType, label: 'Members', icon: 'mdi:account-group', count: team.members.length },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-foreground/10 bg-secondary/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Banner */}
                    <div
                        className="h-32 -mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden"
                        style={team.banner ? {
                            backgroundImage: `url(${team.banner})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        } : {
                            background: 'linear-gradient(135deg, rgba(var(--primary), 0.15) 0%, rgba(var(--secondary), 0.15) 100%)'
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
                    </div>

                    {/* Team Info */}
                    <div className="-mt-16 pb-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                            {/* Logo */}
                            <div className="relative">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-xl rounded-xl">
                                    <AvatarImage src={team.logo || undefined} alt={team.displayName} />
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-hebden text-2xl rounded-xl">
                                        {getInitials(team.displayName)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h1 className="font-hebden text-2xl font-bold mb-1">{team.displayName}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-nunito mb-3">
                                    <span>@{team.name}</span>
                                    <span className="flex items-center gap-1">
                                        <Icon icon="mdi:calendar" width="14" height="14" />
                                        Created {formatDate(team.createdAt)}
                                    </span>
                                    {team.website && (
                                        <a href={team.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                            <Icon icon="mdi:link" width="14" height="14" />
                                            Website
                                        </a>
                                    )}
                                    {team.discordUrl && (
                                        <a href={team.discordUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                            <Icon icon="mdi:discord" width="14" height="14" />
                                            Discord
                                        </a>
                                    )}
                                </div>

                                {/* Inline Stats */}
                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Icon icon="mdi:account-group" width="16" height="16" className="text-muted-foreground" />
                                        <span className="font-semibold text-foreground">{team.members.length}</span>
                                        <span className="text-muted-foreground">members</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Icon icon="mdi:package-variant" width="16" height="16" className="text-muted-foreground" />
                                        <span className="font-semibold text-foreground">0</span>
                                        <span className="text-muted-foreground">resources</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Icon icon="mdi:server" width="16" height="16" className="text-primary" />
                                        <span className="font-semibold text-foreground">0</span>
                                        <span className="text-muted-foreground">servers</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {team.description && (
                            <div className="mt-4 text-sm text-foreground/90 font-nunito max-w-3xl">
                                {team.description}
                            </div>
                        )}

                        {/* Tabs Navigation */}
                        <div className="flex gap-1 mt-6 border-b border-foreground/10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    relative px-4 py-3 font-hebden text-sm whitespace-nowrap transition-colors flex items-center gap-2
                    ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
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
                            {/* Featured Resources */}
                            <div className="border border-foreground/10 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-hebden text-lg font-semibold flex items-center gap-2">
                                        <Icon icon="mdi:star" width="20" height="20" className="text-primary" />
                                        Featured Resources
                                    </h3>
                                    <button className="text-sm text-primary hover:underline font-nunito">View all</button>
                                </div>
                                <div className="text-center py-12 text-muted-foreground">
                                    <Icon icon="mdi:package-variant-closed" width="48" height="48" className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm font-nunito">No featured resources</p>
                                </div>
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
                            {/* Team Owner */}
                            <div className="border border-foreground/10 rounded-lg p-5">
                                <h3 className="font-hebden text-base font-semibold mb-4">Team Owner</h3>
                                <a
                                    href={`/users/${team.owner.username}`}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={team.owner.image || undefined} alt={team.owner.displayName || team.owner.username} />
                                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 font-hebden text-sm">
                                            {getInitials(team.owner.displayName || team.owner.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-hebden text-sm font-medium truncate">
                                            {team.owner.displayName || team.owner.username}
                                        </div>
                                        <div className="text-xs text-muted-foreground">@{team.owner.username}</div>
                                    </div>
                                </a>
                            </div>
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
                                        <span className="text-muted-foreground font-nunito">Created</span>
                                        <span className="font-semibold">{formatDate(team.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground font-nunito">Last Updated</span>
                                        <span className="font-semibold">{formatDate(team.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resources Tab */}
                {activeTab === 'resources' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-hebden text-xl font-semibold">Resources</h2>
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
                            <div className="col-span-full text-center py-16 border border-dashed border-foreground/10 rounded-lg">
                                <Icon icon="mdi:package-variant-closed" width="64" height="64" className="mx-auto mb-4 text-muted-foreground opacity-50" />
                                <h3 className="font-hebden text-lg font-semibold mb-2">No resources yet</h3>
                                <p className="text-sm text-muted-foreground font-nunito">
                                    This team hasn't published any resources.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Servers Tab */}
                {activeTab === 'servers' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-hebden text-xl font-semibold">Servers</h2>
                            <select className="px-3 py-1.5 text-sm rounded-lg border border-foreground/10 bg-background font-nunito">
                                <option>All Status</option>
                                <option>Online</option>
                                <option>Offline</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-full text-center py-16 border border-dashed border-foreground/10 rounded-lg">
                                <Icon icon="mdi:server-off" width="64" height="64" className="mx-auto mb-4 text-muted-foreground opacity-50" />
                                <h3 className="font-hebden text-lg font-semibold mb-2">No servers</h3>
                                <p className="text-sm text-muted-foreground font-nunito">
                                    This team doesn't own any servers.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Members Tab */}
                {activeTab === 'members' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-hebden text-xl font-semibold">Members ({team.members.length})</h2>
                            <select className="px-3 py-1.5 text-sm rounded-lg border border-foreground/10 bg-background font-nunito">
                                <option>All Roles</option>
                                <option>Owner</option>
                                <option>Admin</option>
                                <option>Member</option>
                            </select>
                        </div>

                        {team.members.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {team.members.map((member) => (
                                    <Link
                                        key={member.user.id}
                                        href={`/users/${member.user.username}`}
                                        className="border border-foreground/10 rounded-lg p-4 hover:border-primary/30 hover:bg-secondary/30 transition-all"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={member.user.image || undefined} alt={member.user.username} />
                                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 font-hebden">
                                                    {getInitials(member.user.displayName || member.user.username)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-hebden font-medium truncate">
                                                    {member.user.displayName || member.user.username}
                                                </div>
                                                <div className="text-sm text-muted-foreground truncate">@{member.user.username}</div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/20 text-primary">
                                                        {member.role}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Joined {formatDate(member.joinedAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 border border-dashed border-foreground/10 rounded-lg">
                                <Icon icon="mdi:account-group-outline" width="64" height="64" className="mx-auto mb-4 text-muted-foreground opacity-50" />
                                <h3 className="font-hebden text-lg font-semibold mb-2">No members</h3>
                                <p className="text-sm text-muted-foreground font-nunito">
                                    This team doesn't have any members yet.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
