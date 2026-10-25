'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Award,
  Ban,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  HeartHandshake,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Tag,
  Undo2,
  UserCheck,
  Wallet,
  X,
} from 'lucide-react';
import type { AdminUserRecord } from '@/hooks/use-admin';
import { useAdminUserDossier } from '@/hooks/use-admin';
import {
  useAdminUpdateCustomerProfile,
  useCustomerProfileForAdmin,
} from '@/hooks/use-customer-profile';
import { isUserProvider } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate, formatPrice, initials, ORDER_STATUS_LABELS } from '@/lib/utils';
import type { Role } from '@needx/types';

interface Customer360ModalProps {
  user: AdminUserRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onBanUser?: (userId: string, reason?: string) => Promise<void>;
  onUnbanUser?: (userId: string) => Promise<void>;
  onToggleProvider?: (user: AdminUserRecord, makeProvider: boolean) => Promise<void>;
  onToggleRole?: (user: AdminUserRecord, role: Role) => Promise<void>;
}

export function Customer360Modal({
  user,
  isOpen,
  onClose,
  onBanUser,
  onUnbanUser,
  onToggleProvider,
  onToggleRole,
}: Customer360ModalProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [banReason, setBanReason] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [internalNotesInput, setInternalNotesInput] = useState<string | null>(null);

  const { data: dossier, isLoading: dossierLoading } = useAdminUserDossier(user?.id ?? null);
  const { data: customerProfile, isLoading: profileLoading } = useCustomerProfileForAdmin(
    user?.id ?? null,
  );
  const updateCustomerProfile = useAdminUpdateCustomerProfile();

  if (!user) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  const handleUpdateKycStatus = async (
    status: 'VERIFIED' | 'REJECTED' | 'PENDING',
    rejectionReason?: string,
  ) => {
    if (!user) return;
    try {
      await updateCustomerProfile.mutateAsync({
        userId: user.id,
        input: {
          kycStatus: status,
          kycRejectionReason:
            status === 'REJECTED' ? rejectionReason || 'Document verification failed.' : undefined,
        },
      });
      toast.success(`Customer KYC status updated to ${status}`);
    } catch {
      toast.error('Failed to update customer KYC status');
    }
  };

  const handleAwardLoyaltyPoints = async (pointsDelta: number) => {
    if (!user) return;
    try {
      await updateCustomerProfile.mutateAsync({
        userId: user.id,
        input: {
          loyaltyPointsDelta: pointsDelta,
        },
      });
      toast.success(
        `${pointsDelta > 0 ? `Awarded ${pointsDelta}` : `Deducted ${Math.abs(pointsDelta)}`} loyalty points`,
      );
    } catch {
      toast.error('Failed to update loyalty points');
    }
  };

  const handleAddTag = async () => {
    if (!user || !newTagInput.trim()) return;
    const tagToAdd = newTagInput.trim();
    const existingTags = customerProfile?.customerTags || [];
    if (existingTags.includes(tagToAdd)) {
      toast.info('Tag already attached');
      return;
    }
    try {
      await updateCustomerProfile.mutateAsync({
        userId: user.id,
        input: {
          customerTags: [...existingTags, tagToAdd],
        },
      });
      setNewTagInput('');
      toast.success(`Tag "${tagToAdd}" added`);
    } catch {
      toast.error('Failed to add tag');
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!user) return;
    const existingTags = customerProfile?.customerTags || [];
    try {
      await updateCustomerProfile.mutateAsync({
        userId: user.id,
        input: {
          customerTags: existingTags.filter((t) => t !== tagToRemove),
        },
      });
      toast.success(`Tag "${tagToRemove}" removed`);
    } catch {
      toast.error('Failed to remove tag');
    }
  };

  const handleSaveInternalNotes = async () => {
    if (!user || internalNotesInput === null) return;
    try {
      await updateCustomerProfile.mutateAsync({
        userId: user.id,
        input: {
          internalNotes: internalNotesInput,
        },
      });
      toast.success('Internal CRM notes updated');
    } catch {
      toast.error('Failed to save CRM notes');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-14 ring-2 ring-trust/20 shrink-0">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-trust text-white text-lg font-bold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="font-display text-lg font-bold text-ink">
                    {user.name}
                  </DialogTitle>
                  <Badge variant="outline" className="text-[10px] text-ink-soft">
                    {isUserProvider(user) ? 'MARKETPLACE PROVIDER' : 'CUSTOMER / BUYER'}
                  </Badge>
                  {customerProfile?.loyalty?.tier && (
                    <Badge variant="trust" className="text-[10px] font-mono">
                      TIER: {customerProfile.loyalty.tier}
                    </Badge>
                  )}
                  {user.isBanned ? (
                    <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-bold text-danger border border-danger/20">
                      SUSPENDED
                    </span>
                  ) : (
                    <span className="rounded-full bg-faith/10 px-2 py-0.5 text-[10px] font-bold text-faith border border-faith/20">
                      ACTIVE ACCOUNT
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-ink-faint flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3" /> {user.email || 'No email'}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="size-3" /> {user.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {user.city ?? 'Location unset'}
                  </span>
                  <button
                    onClick={() => handleCopy(user.id, 'User ID')}
                    className="flex items-center gap-1 font-mono hover:text-trust"
                    title="Copy User ID"
                  >
                    <Copy className="size-3" /> {user.id.slice(0, 10)}...
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" asChild className="text-xs">
                <Link href={`/providers/${user.id}`} target="_blank">
                  <ExternalLink className="size-3 mr-1" /> Public View
                </Link>
              </Button>
              {user.isBanned && onUnbanUser && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUnbanUser(user.id)}
                  className="text-xs text-faith border-faith/30 hover:bg-faith/10 font-semibold"
                >
                  <Undo2 className="size-3 mr-1" /> Reinstate
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Multi-Tab Customer Workspace */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 sm:inline-flex sm:w-auto">
            <TabsTrigger value="profile" className="text-xs gap-1.5">
              <HeartHandshake className="size-3.5 text-trust" /> Customer Profile &amp; KYC
            </TabsTrigger>
            <TabsTrigger value="needs" className="text-xs gap-1.5">
              <Package className="size-3.5" /> Needs ({dossier?.stats?.totalNeeds ?? '…'})
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs gap-1.5">
              <ShoppingBag className="size-3.5" /> Deals Pipeline ({
                (dossier?.stats?.totalBuyerOrders ?? 0) + (dossier?.stats?.totalProviderOrders ?? 0)
              })
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs gap-1.5">
              <ShieldCheck className="size-3.5" /> Account &amp; Trust
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Customer Profile, KYC, Loyalty, Tags, Preferences */}
          <TabsContent value="profile" className="space-y-6 pt-3">
            {profileLoading ? (
              <div className="py-12 text-center text-ink-faint">
                <Loader2 className="size-6 animate-spin mx-auto text-trust" />
                <p className="mt-2 text-xs">Loading customer metrics &amp; profile data...</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Buyer Spend & Value Statistics */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-border bg-surface p-3.5">
                    <p className="text-xs text-ink-faint">Total Sourcing Spend</p>
                    <p className="mt-1 font-display text-xl font-bold text-trust">
                      ₹{(customerProfile?.buyerMetrics?.totalAmountSpent ?? 0).toLocaleString('en-IN')}
                    </p>
                    <p className="mt-0.5 text-[10px] text-ink-faint">
                      {customerProfile?.buyerMetrics?.totalOrdersPlaced ?? 0} orders fulfilled
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-3.5">
                    <p className="text-xs text-ink-faint">Average Deal Value</p>
                    <p className="mt-1 font-display text-xl font-bold text-ink">
                      ₹{(customerProfile?.buyerMetrics?.averageOrderValue ?? 0).toLocaleString('en-IN')}
                    </p>
                    <p className="mt-0.5 text-[10px] text-ink-faint">Per completed order</p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-3.5">
                    <p className="text-xs text-ink-faint">Loyalty Tier &amp; Points</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Award className="size-4 text-dawn" />
                      <span className="font-display text-base font-bold text-ink">
                        {customerProfile?.loyalty?.tier || 'BRONZE'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-ink-faint">
                      {customerProfile?.loyalty?.points ?? 0} pts ({customerProfile?.loyalty?.lifetimePoints ?? 0} lifetime)
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-3.5">
                    <p className="text-xs text-ink-faint">Needs &amp; Fulfillment</p>
                    <p className="mt-1 font-display text-xl font-bold text-ink">
                      {customerProfile?.buyerMetrics?.totalNeedsPosted ?? 0} needs
                    </p>
                    <p className="mt-0.5 text-[10px] text-faith font-medium">
                      {Math.round((customerProfile?.buyerMetrics?.fulfillmentRate ?? 1) * 100)}% fulfillment
                    </p>
                  </div>
                </div>

                {/* KYC Compliance Review Card */}
                <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-trust" />
                      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                        Customer KYC &amp; Identity Compliance
                      </h4>
                    </div>
                    <Badge
                      variant={
                        customerProfile?.kyc?.status === 'VERIFIED'
                          ? 'faith'
                          : customerProfile?.kyc?.status === 'REJECTED'
                          ? 'danger'
                          : customerProfile?.kyc?.status === 'PENDING'
                          ? 'accent'
                          : 'outline'
                      }
                      className="text-[10px]"
                    >
                      {customerProfile?.kyc?.status || 'NOT_SUBMITTED'}
                    </Badge>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded-lg border border-border/80 bg-canvas-alt/50 p-3">
                      <p className="text-ink-faint">Document Classification</p>
                      <p className="font-semibold text-ink mt-0.5">
                        {customerProfile?.kyc?.documentType
                          ? customerProfile.kyc.documentType.replace(/_/g, ' ')
                          : 'Not submitted yet'}
                      </p>
                      {customerProfile?.kyc?.idNumberMasked && (
                        <p className="font-mono text-ink-soft text-[11px] mt-1">
                          Ref: {customerProfile.kyc.idNumberMasked}
                        </p>
                      )}
                    </div>
                    <div className="rounded-lg border border-border/80 bg-canvas-alt/50 p-3">
                      <p className="text-ink-faint">Verification Timestamp</p>
                      <p className="font-semibold text-ink mt-0.5">
                        {customerProfile?.kyc?.verifiedAt
                          ? formatDate(customerProfile.kyc.verifiedAt)
                          : 'Not verified'}
                      </p>
                      {customerProfile?.kyc?.rejectionReason && (
                        <p className="text-danger text-[11px] mt-1">
                          Reason: {customerProfile.kyc.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
                    <Button
                      size="sm"
                      variant="faith"
                      onClick={() => handleUpdateKycStatus('VERIFIED')}
                      disabled={
                        updateCustomerProfile.isPending || customerProfile?.kyc?.status === 'VERIFIED'
                      }
                      className="h-7 text-xs"
                    >
                      <Check className="size-3 mr-1" /> Approve Customer KYC
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const reason = window.prompt(
                          'Enter KYC rejection rationale:',
                          'Identity document mismatch',
                        );
                        if (reason) handleUpdateKycStatus('REJECTED', reason);
                      }}
                      disabled={
                        updateCustomerProfile.isPending || customerProfile?.kyc?.status === 'REJECTED'
                      }
                      className="h-7 text-xs text-danger hover:bg-danger/10 hover:text-danger"
                    >
                      <Ban className="size-3 mr-1" /> Reject KYC
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateKycStatus('PENDING')}
                      disabled={updateCustomerProfile.isPending}
                      className="h-7 text-xs text-ink-soft"
                    >
                      Reset to Pending
                    </Button>
                  </div>
                </div>

                {/* Loyalty Points Calibration & Customer Segmentation Tags */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Loyalty Points Adjustment */}
                  <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Award className="size-4 text-dawn" />
                      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                        Loyalty &amp; Reward Balance
                      </h4>
                    </div>
                    <p className="text-xs text-ink-soft">
                      Current Tier: <strong className="text-ink">{customerProfile?.loyalty?.tier || 'BRONZE'}</strong> (
                      {customerProfile?.loyalty?.points ?? 0} points). Adjust balance:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { label: '+50 Pts', val: 50 },
                        { label: '+100 Pts', val: 100 },
                        { label: '+250 Pts', val: 250 },
                        { label: '-50 Pts', val: -50 },
                      ].map((item) => (
                        <Button
                          key={item.label}
                          size="sm"
                          variant="outline"
                          onClick={() => handleAwardLoyaltyPoints(item.val)}
                          disabled={updateCustomerProfile.isPending}
                          className="h-7 text-xs"
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Segmentation Tags */}
                  <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Tag className="size-4 text-trust" />
                      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                        Customer CRM Tags
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                      {customerProfile?.customerTags?.length ? (
                        customerProfile.customerTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-md border border-trust/30 bg-trust/10 px-2 py-0.5 text-xs font-semibold text-trust"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="text-trust hover:text-danger ml-0.5"
                              title="Remove Tag"
                            >
                              <X className="size-3" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-ink-faint italic">No segmentation tags attached.</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Add tag (e.g., VIP, HIGH_VALUE, DELHI_HUB)..."
                        className="text-xs h-7"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddTag}
                        disabled={!newTagInput.trim() || updateCustomerProfile.isPending}
                        className="h-7 text-xs shrink-0"
                      >
                        <Plus className="size-3 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Sourcing Preferences & Internal CRM Notes */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="size-4 text-faith" />
                      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                        Sourcing Preferences
                      </h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-ink-faint">Preferred Categories:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {customerProfile?.preferences?.preferredCategories?.length ? (
                            customerProfile.preferences.preferredCategories.map((c) => (
                              <Badge key={c} variant="outline" className="text-[10px]">
                                {c}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-ink-faint italic">All Marketplace Categories</span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-ink-faint">Preferred Modes:</span>
                          <p className="font-semibold text-ink mt-0.5">
                            {customerProfile?.preferences?.preferredModes?.join(', ') || 'BUY, RENT'}
                          </p>
                        </div>
                        <div>
                          <span className="text-ink-faint">Search Radius:</span>
                          <p className="font-semibold text-ink mt-0.5">
                            {customerProfile?.preferences?.searchRadiusKm ?? 25} km
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="text-ink-faint">Budget Tier:</span>
                        <p className="font-semibold text-ink mt-0.5">
                          {customerProfile?.preferences?.budgetTier || 'STANDARD'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-trust" />
                      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                        Private Operator CRM Notes
                      </h4>
                    </div>
                    <Textarea
                      value={internalNotesInput !== null ? internalNotesInput : customerProfile?.internalNotes || ''}
                      onChange={(e) => setInternalNotesInput(e.target.value)}
                      placeholder="Confidential notes about this customer, verified premises, dispute history, or special considerations..."
                      className="text-xs min-h-[90px] resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={handleSaveInternalNotes}
                        disabled={updateCustomerProfile.isPending}
                        className="h-7 text-xs bg-trust text-white hover:bg-trust-hover"
                      >
                        {updateCustomerProfile.isPending && <Loader2 className="size-3 animate-spin mr-1" />}
                        Save Notes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: Customer Needs Pipeline */}
          <TabsContent value="needs" className="space-y-4 pt-3">
            {dossierLoading ? (
              <div className="py-12 text-center text-ink-faint">
                <Loader2 className="size-6 animate-spin mx-auto text-trust" />
                <p className="mt-2 text-xs">Loading customer&apos;s demand stream...</p>
              </div>
            ) : !dossier?.needs || dossier.needs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center">
                <Package className="size-8 text-ink-faint mx-auto" />
                <p className="mt-2 font-display text-sm font-semibold text-ink">No Needs Posted</p>
                <p className="text-xs text-ink-faint">This customer has not posted any needs yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dossier.needs.map((need) => (
                  <div
                    key={need.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3.5 hover:border-trust/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-display text-xs font-bold text-ink truncate">{need.title}</h5>
                        <Badge variant="outline" className="text-[10px]">
                          {need.status}
                        </Badge>
                      </div>
                      {need.description && (
                        <p className="mt-1 text-xs text-ink-soft line-clamp-1">{need.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-ink-faint flex-wrap">
                        <span className="flex items-center gap-1">
                          <Wallet className="size-3" />
                          {need.budget?.max ? `Budget: ₹${need.budget.max.toLocaleString('en-IN')}` : 'Flexible'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" /> {need.location.label}
                        </span>
                        <span>Posted {formatDate(need.createdAt)}</span>
                      </div>
                    </div>

                    <Button size="sm" variant="outline" asChild className="h-8 text-xs shrink-0">
                      <Link href={`/needs/${need.id}`} target="_blank">
                        <Eye className="size-3 mr-1" /> View Need
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: Deals & Orders Pipeline */}
          <TabsContent value="orders" className="space-y-4 pt-3">
            {dossierLoading ? (
              <div className="py-12 text-center text-ink-faint">
                <Loader2 className="size-6 animate-spin mx-auto text-trust" />
                <p className="mt-2 text-xs">Loading transaction escrow records...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink mb-2">
                    Orders Placed by Customer ({dossier?.buyerOrders?.length ?? 0})
                  </h4>
                  {!dossier?.buyerOrders || dossier.buyerOrders.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-ink-faint">
                      No purchase or rental orders placed yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dossier.buyerOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 text-xs"
                        >
                          <div>
                            <span className="font-mono text-ink-faint">#{order.id.slice(0, 8)}</span>
                            <p className="font-bold text-ink mt-0.5">
                              {formatPrice(order.amount, order.currency)}
                            </p>
                            <span className="text-[10px] text-ink-faint">{formatDate(order.createdAt)}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {ORDER_STATUS_LABELS[order.status] || order.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 4: Account & Trust Scorecard */}
          <TabsContent value="security" className="space-y-6 pt-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-surface p-3.5">
                <p className="text-xs text-ink-faint">Rating CSAT</p>
                <p className="mt-1 font-display text-xl font-bold text-amber-500 flex items-center gap-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {user.trust?.ratingAverage ? user.trust.ratingAverage.toFixed(1) : '5.0'}
                </p>
                <p className="mt-0.5 text-[10px] text-ink-faint">{user.trust?.ratingCount ?? 0} reviews</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3.5">
                <p className="text-xs text-ink-faint">Deals Completed</p>
                <p className="mt-1 font-display text-xl font-bold text-ink">
                  {user.trust?.completedTransactions ?? 0}
                </p>
                <p className="mt-0.5 text-[10px] text-ink-faint">Verified orders</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3.5">
                <p className="text-xs text-ink-faint">Response Rate</p>
                <p className="mt-1 font-display text-xl font-bold text-faith">
                  {Math.round((user.trust?.responseRate ?? 1) * 100)}%
                </p>
                <p className="mt-0.5 text-[10px] text-ink-faint">Avg reply under 1 hr</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3.5">
                <p className="text-xs text-ink-faint">Cancellation Rate</p>
                <p className="mt-1 font-display text-xl font-bold text-ink">
                  {Math.round((user.trust?.cancellationRate ?? 0) * 100)}%
                </p>
                <p className="mt-0.5 text-[10px] text-ink-faint">Platform benchmark &lt; 5%</p>
              </div>
            </div>

            {/* Provider Authorization Toggle */}
            {onToggleProvider && (
              <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                      Marketplace Provider Privileges
                    </h4>
                    <p className="text-xs text-ink-soft">
                      {isUserProvider(user)
                        ? 'Customer is authorized as a provider to publish inventory and quote on needs.'
                        : 'Customer is a standard seeker. Promoting enables business tools and provider directory listing.'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={isUserProvider(user) ? 'outline' : 'hope'}
                    onClick={() => onToggleProvider(user, !isUserProvider(user))}
                    className="text-xs shrink-0"
                  >
                    {isUserProvider(user) ? 'Revoke Provider Privileges' : 'Promote to Provider'}
                  </Button>
                </div>
              </div>
            )}

            {/* Account Suspension Panel */}
            <div className="rounded-xl border border-danger/20 bg-danger-soft/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-danger">
                <ShieldAlert className="size-4" />
                <span className="text-xs font-bold">Account Suspension Control</span>
              </div>
              {user.isBanned ? (
                <div className="space-y-2">
                  <p className="text-xs text-ink-soft">
                    This customer is currently suspended from trading and posting. Reinstating will immediately restore marketplace access.
                  </p>
                  {onUnbanUser && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUnbanUser(user.id)}
                      className="text-xs text-faith border-faith/30 hover:bg-faith/10 font-bold"
                    >
                      <Undo2 className="size-3.5 mr-1" /> Reinstate Customer Account
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Suspension rationale for audit log (e.g., fraudulent listings, policy violation)..."
                    className="text-xs bg-surface"
                  />
                  {onBanUser && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onBanUser(user.id, banReason)}
                      className="text-xs font-semibold"
                    >
                      <Ban className="size-3.5 mr-1" /> Suspend Customer Account
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
