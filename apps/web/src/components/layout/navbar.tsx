'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Crown,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './theme-toggle';
import { NotificationBell } from '@/components/shared/notification-bell';
import { LocationSelector } from './location-selector';
import { isUserAdmin, isUserProvider, useCurrentUser, useLogout } from '@/hooks/use-auth';
import { initials } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();

  const isProvider = isUserProvider(user);
  const isAdmin = isUserAdmin(user);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-canvas/85 backdrop-blur-md safe-top">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0f294a] via-[#1e40af] to-[#0d9488] text-sm font-bold text-white shadow-sm ring-1 ring-white/20 transition-transform group-hover:scale-105 font-display">
              N
            </span>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight text-ink leading-none">NEEDX</span>
              <span className="hidden sm:block text-[9px] font-semibold tracking-wider uppercase text-hope mt-0.5">Hope · Faith · Trust</span>
            </div>
          </Link>

          <LocationSelector variant="navbar" />
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/explore" className="text-sm font-medium text-ink-soft hover:text-hope transition-colors">
            Explore
          </Link>
          <Link href="/listings" className="text-sm font-medium text-ink-soft hover:text-hope transition-colors">
            Listings
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium text-ink-soft hover:text-hope transition-colors">
            How it works
          </Link>
          {isProvider && (
            <Link href="/provider" className="text-sm font-medium text-ink-soft hover:text-hope transition-colors">
              Provider dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-ink-soft hover:text-ink" asChild>
            <Link href="/search" aria-label="Search">
              <Search className="size-5" />
            </Link>
          </Button>
          <ThemeToggle className="hidden sm:inline-flex" />

          {isLoading ? null : user ? (
            <>
              <NotificationBell />
              <Button variant="hope" size="sm" asChild className="hidden sm:inline-flex shadow-sm font-semibold">
                <Link href="/needs/new">
                  <Plus /> Need
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 shadow-card-hover">
                  {/* User Account Header */}
                  <div className="flex items-center gap-3 px-2 py-2.5 rounded-lg bg-canvas-alt/60 mb-1 border border-border/50">
                    <Avatar className="size-10 ring-2 ring-trust/20 shrink-0">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback className="bg-trust text-white font-semibold">
                        {initials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-ink truncate">{user.name}</p>
                      <p className="text-[11px] text-ink-faint truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 rounded bg-[#0f294a] px-1.5 py-0.5 text-[9px] font-bold text-dawn uppercase tracking-wider">
                            <Crown className="size-2.5 text-dawn" /> Admin
                          </span>
                        )}
                        {isProvider ? (
                          <span className="inline-flex items-center gap-1 rounded bg-hope-soft px-1.5 py-0.5 text-[9px] font-bold text-hope uppercase tracking-wider">
                            <Store className="size-2.5" /> Provider
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-faith-soft px-1.5 py-0.5 text-[9px] font-medium text-faith">
                            Member
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* General / Seeker Navigation */}
                  <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-ink-faint px-2 py-1">
                    Seeker Workspace
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="size-4 text-ink-soft" />
                      <span>Overview</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/needs" className="flex items-center gap-2">
                      <Package className="size-4 text-hope" />
                      <span>My Needs</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/orders" className="flex items-center gap-2">
                      <ShoppingBag className="size-4 text-trust" />
                      <span>Orders & Escrow</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/messages" className="flex items-center gap-2">
                      <MessageCircle className="size-4 text-faith" />
                      <span>Messages</span>
                    </Link>
                  </DropdownMenuItem>

                  {/* Role-Specific: Provider Section */}
                  {isProvider ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-hope px-2 py-1 flex items-center justify-between">
                        <span>Provider Hub</span>
                        <span className="rounded bg-hope/10 px-1 text-[9px] text-hope">Active</span>
                      </DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/provider" className="flex items-center gap-2 font-medium text-hope">
                          <Store className="size-4 text-hope" />
                          <span>Provider Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/provider/requests" className="flex items-center gap-2">
                          <Inbox className="size-4 text-ink-soft" />
                          <span>Matching Requests</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/provider/offers" className="flex items-center gap-2">
                          <Send className="size-4 text-ink-soft" />
                          <span>My Offers</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="bg-hope-soft/40 hover:bg-hope-soft transition-colors text-hope font-medium">
                        <Link href="/dashboard/settings" className="flex items-center gap-2">
                          <Sparkles className="size-4 text-hope animate-pulse" />
                          <span>Become a Provider</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {/* Role-Specific: Admin Section */}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-trust px-2 py-1 flex items-center justify-between">
                        <span>Platform Ops</span>
                        <span className="rounded bg-trust/10 px-1 text-[9px] text-trust">CRM</span>
                      </DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2 font-semibold text-trust hover:text-trust-dark">
                          <ShieldCheck className="size-4 text-trust" />
                          <span>Admin CRM Ops</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />

                  {/* Account Settings */}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center gap-2">
                      <UserIcon className="size-4 text-ink-soft" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center gap-2">
                      <Settings className="size-4 text-ink-soft" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Sign Out */}
                  <DropdownMenuItem
                    className="text-danger focus:bg-danger-soft focus:text-danger cursor-pointer"
                    onClick={async () => {
                      await logout.mutateAsync();
                      router.push('/');
                    }}
                  >
                    <LogOut className="size-4 text-danger" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-ink-soft hover:text-ink">
                <Link href="/login">Log in</Link>
              </Button>
              <Button variant="default" size="sm" asChild className="shadow-sm font-semibold">
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
