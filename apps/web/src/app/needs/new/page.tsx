'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import type { ParsedNeedPreview } from '@needx/types';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NeedPreviewCard, type NeedDraft } from '@/components/needs/need-preview-card';
import { useParseNeed, useCreateNeed } from '@/hooks/use-needs';
import { useCategories } from '@/hooks/use-categories';
import { useCurrentUser } from '@/hooks/use-auth';
import { INDIAN_CITIES } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';

function NewNeedInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialText = searchParams.get('text') ?? '';

  const [text, setText] = useState(initialText);
  const [preview, setPreview] = useState<ParsedNeedPreview | null>(null);
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: categories = [] } = useCategories();
  const parseNeed = useParseNeed();
  const createNeed = useCreateNeed();

  useEffect(() => {
    if (initialText && !preview) {
      parseNeed.mutate({ text: initialText }, { onSuccess: setPreview });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText]);

  if (!userLoading && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Sign in to post a need</h1>
        <p className="mt-2 text-sm text-ink-soft">Creating a need takes seconds once you&apos;re signed in.</p>
        <Button variant="default" className="mt-6" asChild>
          <a href={`/login?next=/needs/new${text ? `?text=${encodeURIComponent(text)}` : ''}`}>
            Sign in <ArrowRight />
          </a>
        </Button>
      </div>
    );
  }

  const handlePost = async (draft: NeedDraft) => {
    const city = INDIAN_CITIES.find((c) => c.name === draft.cityName);
    const coordinates = draft.coordinates || (city ? [city.lng, city.lat] : [77.3649, 28.628]);
    const cityName = draft.cityName || city?.name || 'Noida';
    const stateName = draft.state || city?.state || 'Uttar Pradesh';
    const label = draft.addressLabel || `${cityName}, ${stateName}`;

    try {
      const need = await createNeed.mutateAsync({
        title: draft.title,
        description: draft.description,
        categoryId: draft.categoryId,
        modes: draft.modes as never,
        budget: draft.budgetMax ? { max: draft.budgetMax, currency: 'INR' } : undefined,
        quantity: draft.quantity,
        location: {
          point: { type: 'Point', coordinates: coordinates as [number, number] },
          label,
          city: cityName,
          state: stateName,
        },
        attributes: {},
        rawInput: text,
        parseSource: 'RULE_BASED',
      });
      toast.success('Need posted — finding matches now.');
      router.push(`/needs/${need.id}`);
    } catch {
      toast.error('Could not post your need. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:py-14">
      <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">What do you need?</h1>
      <p className="mt-2 text-sm text-ink-soft">Describe it naturally — NEEDX will structure it for you.</p>

      <div className="mt-6">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="I need a projector for 2 days in Gurgaon under ₹3000"
          autoFocus
        />
        <Button
          variant="hope"
          className="mt-3 w-full"
          loading={parseNeed.isPending}
          disabled={text.trim().length < 4}
          onClick={() => parseNeed.mutate({ text }, { onSuccess: setPreview })}
        >
          Understand my need <ArrowRight />
        </Button>
      </div>

      <div className="mt-6">
        {parseNeed.isPending && !preview ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : preview ? (
          <NeedPreviewCard preview={preview} categories={categories} rawText={text} onPost={handlePost} posting={createNeed.isPending} />
        ) : null}
      </div>
    </div>
  );
}

export default function NewNeedPage() {
  return (
    <Suspense fallback={null}>
      <NewNeedInner />
    </Suspense>
  );
}
