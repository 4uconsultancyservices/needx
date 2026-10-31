'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  Crown,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
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
  ChevronRight,
  MapPin,
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
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ThemeToggle } from './theme-toggle';
import { NotificationBell } from '@/components/shared/notification-bell';
import { LocationSelector } from './location-selector';
import { isUserAdmin, isUserProvider, useCurrentUser, useLogout } from '@/hooks/use-auth';
import { initials, cn } from '@/lib/utils';
import { useUserLocation } from '@/contexts/location-context';

export function Navbar() {
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();
  const { location } = useUserLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isProvider = isUserProvider(user);
  const isAdmin = isUserAdmin(user);

  if (pathname?.startsWith('/admin')) return null;

  const radiusLabel = location.radiusKm === 0 ? 'All India' : location.radiusKm + ' km';
  const locationLabel = location.locality ? location.locality.split(' ')[0] : location.cityName;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-canvas/90 backdrop-blur-md safe-top transition-colors">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-1 xs:gap-1.5 sm:gap-3 px-2 xs:px-2.5 sm:px-6 lg:px-8">

          {/* Left: Brand + Location */}
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 shrink min-w-0">
            <Link href="/" className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 shrink-0 group">
              <span className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0f294a] via-[#1e40af] to-[#0d9488] text-xs sm:text-sm font-bold text-white shadow-sm ring-1 ring-white/20 transition-transform group-hover:scale-105 font-display">
                N
              </span>
              <div className="flex flex-col">
                <span className="font-display text-base sm:text-lg font-bold tracking-tight text-ink leading-none">NEEDX</span>
                <span className="hidden sm:block text-[9px] font-semibold tracking-wider uppercase text-hope mt-0.5">Hope · Faith · Trust</span>
              </div>
            </Link>
            <LocationSelector variant="navbar" />
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden items-center gap-5 lg:gap-7 md:flex">
            <Link href="/explore" className={cn('text-sm font-medium transition-colors hover:text-hope', pathname === '/explore' ? 'text-hope font-semibold' : 'text-ink-soft')}>Explore</Link>
            <Link href="/listings" className={cn('text-sm font-medium transition-colors hover:text-hope', pathname.startsWith('/listings') ? 'text-hope font-semibold' : 'text-ink-soft')}>Listings</Link>
            <Link href="/providers" className={cn('text-sm font-medium transition-colors hover:text-hope', pathname.startsWith('/providers') ? 'text-hope font-semibold' : 'text-ink-soft')}>Providers</Link>
            <Link href="/how-it-works" className={cn('text-sm font-medium transition-colors hover:text-hope', pathname === '/how-it-works' ? 'text-hope font-semibold' : 'text-ink-soft')}>How it works</Link>
            {isProvider && (
              <Link href="/provider" className={cn('text-sm font-medium transition-colors hover:text-hope', pathname.startsWith('/provider') ? 'text-hope font-semibold' : 'text-ink-soft')}>Provider dashboard</Link>
            )}
          </nav>

          {/* Right: Actions + Auth + Hamburger */}
          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 shrink-0">
            <Button variant="ghost" size="icon" className="size-8 sm:size-9 text-ink-soft hover:text-ink shrink-0" asChild>
              <Link href="/search" aria-label="Search"><Search className="size-4" /></Link>
            </Button>

            <ThemeToggle className="hidden sm:inline-flex" />

            {isLoading ? (
              <div className="h-8 w-16 sm:w-20 rounded-control bg-canvas-alt/80 animate-pulse shrink-0 border border-border/40" />
            ) : user ? (
              <>
                <NotificationBell />
                <Button variant="hope" size="sm" asChild className="hidden sm:inline-flex h-9 px-3.5 shadow-sm font-semibold text-sm">
                  <Link href="/needs/new"><Plus className="size-4 mr-1" /> Need</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust cursor-pointer shrink-0" aria-label="User account menu">
                      <Avatar className="size-8 sm:size-9 ring-1 ring-border">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="bg-trust/10 text-trust text-xs font-bold">{initials(user.name)}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-64 max-w-xs p-2 shadow-card-hover">
                    <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-canvas-alt/60 mb-1 border border-border/50">
                      <Avatar className="size-9 ring-2 ring-trust/20 shrink-0">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="bg-trust text-white text-xs font-semibold">{initials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-ink truncate">{user.name}</p>
                        <p className="text-[11px] text-ink-faint truncate">{user.email}</p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          {isAdmin && <span className="inline-flex items-center gap-1 rounded bg-[#0f294a] px-1.5 py-0.5 text-[9px] font-bold text-dawn uppercase tracking-wider"><Crown className="size-2.5 text-dawn" /> Admin</span>}
                          {isProvider ? (
                            <span className="inline-flex items-center gap-1 rounded bg-hope-soft px-1.5 py-0.5 text-[9px] font-bold text-hope uppercase tracking-wider"><Store className="size-2.5" /> Provider</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-faith-soft px-1.5 py-0.5 text-[9px] font-medium text-faith">Member</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-ink-faint px-2 py-1">Seeker Workspace</DropdownMenuLabel>
                    <DropdownMenuItem asChild><Link href="/dashboard" className="flex items-center gap-2"><LayoutDashboard className="size-4 text-ink-soft" /><span>Overview</span></Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/needs" className="flex items-center gap-2"><Package className="size-4 text-hope" /><span>My Needs</span></Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/orders" className="flex items-center gap-2"><ShoppingBag className="size-4 text-trust" /><span>Orders and Escrow</span></Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/messages" className="flex items-center gap-2"><MessageCircle className="size-4 text-faith" /><span>Messages</span></Link></DropdownMenuItem>
                    {isProvider ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-hope px-2 py-1 flex items-center justify-between"><span>Provider Hub</span><span className="rounded bg-hope/10 px-1 text-[9px] text-hope">Active</span></DropdownMenuLabel>
                        <DropdownMenuItem asChild><Link href="/provider" className="flex items-center gap-2 font-medium text-hope"><Store className="size-4 text-hope" /><span>Provider Dashboard</span></Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/provider/requests" className="flex items-center gap-2"><Inbox className="size-4 text-ink-soft" /><span>Matching Requests</span></Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/provider/offers" className="flex items-center gap-2"><Send className="size-4 text-ink-soft" /><span>My Offers</span></Link></DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="bg-hope-soft/40 hover:bg-hope-soft transition-colors text-hope font-medium">
                          <Link href="/dashboard/settings" className="flex items-center gap-2"><Sparkles className="size-4 text-hope animate-pulse" /><span>Become a Provider</span></Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-trust px-2 py-1 flex items-center justify-between"><span>Platform Ops</span><span className="rounded bg-trust/10 px-1 text-[9px] text-trust">CRM</span></DropdownMenuLabel>
                        <DropdownMenuItem asChild><Link href="/admin" className="flex items-center gap-2 font-semibold text-trust"><ShieldCheck className="size-4 text-trust" /><span>Admin CRM Ops</span></Link></DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/dashboard/profile" className="flex items-center gap-2"><UserIcon className="size-4 text-ink-soft" /><span>Profile</span></Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/settings" className="flex items-center gap-2"><Settings className="size-4 text-ink-soft" /><span>Settings</span></Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-danger focus:bg-danger-soft focus:text-danger cursor-pointer" onClick={async () => { await logout.mutateAsync(); router.push('/'); }}>
                      <LogOut className="size-4 text-danger" /><span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="text-ink-soft hover:text-ink hidden sm:inline-flex h-9 px-3 text-xs sm:text-sm">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button variant="default" size="sm" asChild className="shadow-sm font-semibold h-8 sm:h-9 px-2.5 sm:px-3.5 text-xs sm:text-sm shrink-0">
                  <Link href="/login">
                    <span className="sm:hidden">Sign in</span>
                    <span className="hidden sm:inline">Sign up</span>
                  </Link>
                </Button>
              </>
            )}

            {/* Mobile hamburger inside Sheet */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="md:hidden inline-flex items-center justify-center size-9 rounded-lg text-ink hover:bg-canvas-alt hover:text-hope shrink-0 transition-colors"
                  aria-label="Open navigation menu"
                >
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[86vw] max-w-sm p-0 flex flex-col h-full bg-surface border-border">
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/70 bg-canvas-alt/50">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 group">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0f294a] via-[#1e40af] to-[#0d9488] text-xs font-bold text-white shadow-sm ring-1 ring-white/20 font-display">N</span>
                    <div className="flex flex-col">
                      <SheetTitle className="font-display text-base font-bold tracking-tight text-ink leading-none text-left">NEEDX</SheetTitle>
                      <SheetDescription className="sr-only">Navigation drawer and account menu</SheetDescription>
                      <span className="text-[9px] font-semibold tracking-wider uppercase text-hope mt-0.5">Hope · Faith · Trust</span>
                    </div>
                  </Link>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  {user ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-canvas-alt/70 border border-border/60">
                      <Avatar className="size-10 ring-2 ring-trust/20 shrink-0">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="bg-trust text-white text-xs font-bold">{initials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-ink truncate">{user.name}</p>
                        <p className="text-[11px] text-ink-faint truncate">{user.email}</p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          {isAdmin && <span className="inline-flex items-center gap-1 rounded bg-[#0f294a] px-1.5 py-0.5 text-[9px] font-bold text-dawn uppercase tracking-wider"><Crown className="size-2.5 text-dawn" /> Admin</span>}
                          {isProvider ? (
                            <span className="inline-flex items-center gap-1 rounded bg-hope-soft px-1.5 py-0.5 text-[9px] font-bold text-hope uppercase tracking-wider"><Store className="size-2.5" /> Provider</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-faith-soft px-1.5 py-0.5 text-[9px] font-medium text-faith">Member</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-trust/5 via-hope/5 to-transparent border border-border/80">
                      <p className="text-xs font-bold text-ink mb-1">Welcome to NEEDX</p>
                      <p className="text-[11px] text-ink-soft mb-3">Say what you need. NEEDX finds who can provide it nearby.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-8" asChild onClick={() => setMobileMenuOpen(false)}>
                          <Link href="/login">Log in</Link>
                        </Button>
                        <Button variant="default" size="sm" className="w-full text-xs font-semibold h-8" asChild onClick={() => setMobileMenuOpen(false)}>
                          <Link href="/register">Sign up</Link>
                        </Button>
                      </div>
                    </div>
                  )}

                  <Link href="/needs/new" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-hope via-hope to-trust text-white shadow-sm font-semibold transition-transform active:scale-[0.98]">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0"><Plus className="size-5 stroke-[2.5]" /></div>
                      <div>
                        <div className="text-xs font-bold leading-tight">Post a Need</div>
                        <div className="text-[10px] text-white/80">Get matched with providers</div>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-white/70" />
                  </Link>

                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-ink-faint px-2 py-1">Explore Marketplace</div>
                    <Link href="/explore" onClick={() => setMobileMenuOpen(false)} className={cn('flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors', pathname === '/explore' ? 'bg-hope-soft text-hope font-semibold' : 'text-ink hover:bg-canvas-alt')}>
                      <div className="flex items-center gap-2.5"><Compass className="size-4.5 text-trust" /><span>Explore Needs</span></div>
                      <ChevronRight className="size-4 text-ink-faint" />
                    </Link>
                    <Link href="/listings" onClick={() => setMobileMenuOpen(false)} className={cn('flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors', pathname.startsWith('/listings') ? 'bg-hope-soft text-hope font-semibold' : 'text-ink hover:bg-canvas-alt')}>
                      <div className="flex items-center gap-2.5"><Package className="size-4.5 text-hope" /><span>Available Listings</span></div>
                      <ChevronRight className="size-4 text-ink-faint" />
                    </Link>
                    <Link href="/providers" onClick={() => setMobileMenuOpen(false)} className={cn('flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors', pathname.startsWith('/providers') ? 'bg-hope-soft text-hope font-semibold' : 'text-ink hover:bg-canvas-alt')}>
                      <div className="flex items-center gap-2.5"><Store className="size-4.5 text-faith" /><span>Verified Providers</span></div>
                      <ChevronRight className="size-4 text-ink-faint" />
                    </Link>
                    <Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)} className={cn('flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors', pathname === '/how-it-works' ? 'bg-hope-soft text-hope font-semibold' : 'text-ink hover:bg-canvas-alt')}>
                      <div className="flex items-center gap-2.5"><Sparkles className="size-4.5 text-accent" /><span>How It Works</span></div>
                      <ChevronRight className="size-4 text-ink-faint" />
                    </Link>
                    <Link href="/search" onClick={() => setMobileMenuOpen(false)} className={cn('flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors', pathname === '/search' ? 'bg-hope-soft text-hope font-semibold' : 'text-ink hover:bg-canvas-alt')}>
                      <div className="flex items-center gap-2.5"><Search className="size-4.5 text-ink-soft" /><span>Search</span></div>
                      <ChevronRight className="size-4 text-ink-faint" />
                    </Link>
                  </div>

                  {user && (
                    <>
                      <div className="border-t border-border/70 pt-3 space-y-1">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-ink-faint px-2 py-1">My Account</div>
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-canvas-alt">
                          <div className="flex items-center gap-2.5"><LayoutDashboard className="size-4.5 text-ink-soft" /><span>Dashboard Overview</span></div>
                          <ChevronRight className="size-4 text-ink-faint" />
                        </Link>
                        <Link href="/dashboard/needs" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-canvas-alt">
                          <div className="flex items-center gap-2.5"><Package className="size-4.5 text-hope" /><span>My Posted Needs</span></div>
                          <ChevronRight className="size-4 text-ink-faint" />
                        </Link>
                        <Link href="/dashboard/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-canvas-alt">
                          <div className="flex items-center gap-2.5"><ShoppingBag className="size-4.5 text-trust" /><span>Orders and Escrow</span></div>
                          <ChevronRight className="size-4 text-ink-faint" />
                        </Link>
                        <Link href="/dashboard/messages" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-canvas-alt">
                          <div className="flex items-center gap-2.5"><MessageCircle className="size-4.5 text-faith" /><span>Messages</span></div>
                          <ChevronRight className="size-4 text-ink-faint" />
                        </Link>
                      </div>

                      <div className="border-t border-border/70 pt-3 space-y-1">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-hope px-2 py-1 flex items-center justify-between">
                          <span>Provider Space</span>
                          {isProvider && <span className="rounded bg-hope/10 px-1 text-[9px] text-hope font-semibold">Active</span>}
                        </div>
                        {isProvider ? (
                          <>
                            <Link href="/provider" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-hope hover:bg-hope-soft/30">
                              <div className="flex items-center gap-2.5"><Store className="size-4.5 text-hope" /><span>Provider Dashboard</span></div>
                              <ChevronRight className="size-4 text-ink-faint" />
                            </Link>
                            <Link href="/provider/requests" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-canvas-alt">
                              <div className="flex items-center gap-2.5"><Inbox className="size-4.5 text-ink-soft" /><span>Matching Requests</span></div>
                              <ChevronRight className="size-4 text-ink-faint" />
                            </Link>
                            <Link href="/provider/offers" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-canvas-alt">
                              <div className="flex items-center gap-2.5"><Send className="size-4.5 text-ink-soft" /><span>My Offers</span></div>
                              <ChevronRight className="size-4 text-ink-faint" />
                            </Link>
                          </>
                        ) : (
                          <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-hope-soft/40 hover:bg-hope-soft text-hope font-medium text-sm transition-colors">
                            <div className="flex items-center gap-2.5"><Sparkles className="size-4.5 text-hope animate-pulse" /><span>Become a Provider</span></div>
                            <ChevronRight className="size-4 text-hope" />
                          </Link>
                        )}
                      </div>

                      {isAdmin && (
                        <div className="border-t border-border/70 pt-3 space-y-1">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-trust px-2 py-1">Platform Ops</div>
                          <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-trust hover:bg-trust-soft/30">
                            <div className="flex items-center gap-2.5"><ShieldCheck className="size-4.5 text-trust" /><span>Admin CRM Ops</span></div>
                            <ChevronRight className="size-4 text-trust" />
                          </Link>
                        </div>
                      )}

                      <div className="border-t border-border/70 pt-3 space-y-1">
                        <Link href="/dashboard/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-canvas-alt">
                          <div className="flex items-center gap-2.5"><UserIcon className="size-4.5 text-ink-soft" /><span>Profile</span></div>
                          <ChevronRight className="size-4 text-ink-faint" />
                        </Link>
                        <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-canvas-alt">
                          <div className="flex items-center gap-2.5"><Settings className="size-4.5 text-ink-soft" /><span>Settings</span></div>
                          <ChevronRight className="size-4 text-ink-faint" />
                        </Link>
                        <button
                          type="button"
                          onClick={async () => { setMobileMenuOpen(false); await logout.mutateAsync(); router.push('/'); }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-danger hover:bg-danger-soft transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5"><LogOut className="size-4.5 text-danger" /><span>Log out</span></div>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Drawer Footer */}
                <div className="border-t border-border/80 p-4 bg-canvas-alt/40 safe-bottom space-y-3">
                  <div className="flex items-center justify-between text-xs text-ink-soft">
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin className="size-3.5 text-trust" />
                      <span>Location:</span>
                      <strong className="text-ink">{locationLabel}</strong>
                      <span className="text-ink-faint">({radiusLabel})</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-medium text-ink-soft">Appearance theme</span>
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

          </div>
        </div>
      </header>
    </>
  );
}
