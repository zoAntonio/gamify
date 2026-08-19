import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { habitService } from '@/features/habits/services/habitService';
import type { Habit, PageResponse } from '@/features/habits/types/habit.types';

// Ticket dette technique (tests automatisés) : mock du service layer, pas du fetch —
// même frontière que préconisée par frontend-workflow.md (hook custom consommant
// habitService, jamais d'appel réseau direct dans le test du hook).
vi.mock('@/features/habits/services/habitService', () => ({
  habitService: {
    listDomaines: vi.fn(),
    listHabits: vi.fn(),
    createHabit: vi.fn(),
    checkHabit: vi.fn(),
    cancelHabitDay: vi.fn(),
    checkHabitDay: vi.fn(),
  },
}));

const mockedHabitService = vi.mocked(habitService);

const buildHabit = (overrides: Partial<Habit> = {}): Habit => ({
  id: 1,
  nom: 'Pompes',
  domaineId: 1,
  domaineNom: 'Sport',
  attributCible: 'FOR',
  icone: '💪',
  couleur: '#ff0000',
  xpRecompense: 10,
  streakCourant: 3,
  meilleurStreak: 5,
  faitAujourdhui: false,
  completions: [],
  ...overrides,
});

const buildPage = (content: Habit[]): PageResponse<Habit> => ({
  content,
  totalElements: content.length,
  totalPages: 1,
  number: 0,
  size: 100,
});

describe('useHabits', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('useHabits_montage_chargeLesHabitudesDepuisLeService', async () => {
    const habit = buildHabit();
    mockedHabitService.listHabits.mockResolvedValue(buildPage([habit]));

    const { result } = renderHook(() => useHabits());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.habits).toEqual([habit]);
    expect(result.current.error).toBeNull();
  });

  it('useHabits_erreurDeChargement_exposeUneErreurEtListeVide', async () => {
    mockedHabitService.listHabits.mockRejectedValue(new Error('Erreur réseau'));

    const { result } = renderHook(() => useHabits());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.habits).toEqual([]);
  });

  it('toggleHabit_appelReussi_metAJourLHabitudeAvecLaReponseDuServeur', async () => {
    const habit = buildHabit({ id: 1, faitAujourdhui: false, streakCourant: 3 });
    mockedHabitService.listHabits.mockResolvedValue(buildPage([habit]));
    const habitMisAJour = buildHabit({ id: 1, faitAujourdhui: true, streakCourant: 4 });
    mockedHabitService.checkHabit.mockResolvedValue(habitMisAJour);

    const { result } = renderHook(() => useHabits());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let erreur: Error | null = null;
    await act(async () => {
      erreur = await result.current.toggleHabit(1);
    });

    expect(erreur).toBeNull();
    expect(mockedHabitService.checkHabit).toHaveBeenCalledWith(1);
    expect(result.current.habits[0]).toEqual(habitMisAJour);
  });

  it('toggleHabit_appelEnEchec_annuleLaMiseAJourOptimisteEtRetourneLErreur', async () => {
    const habit = buildHabit({ id: 1, faitAujourdhui: false, streakCourant: 3 });
    mockedHabitService.listHabits.mockResolvedValue(buildPage([habit]));
    mockedHabitService.checkHabit.mockRejectedValue(new Error('Déjà cochée'));

    const { result } = renderHook(() => useHabits());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let erreur: Error | null = null;
    await act(async () => {
      erreur = await result.current.toggleHabit(1);
    });

    expect(erreur).toBeInstanceOf(Error);
    // Rollback : l'état d'origine (avant la mise à jour optimiste) est restauré.
    expect(result.current.habits[0]).toEqual(habit);
  });

  it('toggleHabit_habitudeDejaFaiteAujourdhui_neAppelleJamaisLeServiceEtRetourneNull', async () => {
    const habit = buildHabit({ id: 1, faitAujourdhui: true });
    mockedHabitService.listHabits.mockResolvedValue(buildPage([habit]));

    const { result } = renderHook(() => useHabits());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let erreur: Error | null = null;
    await act(async () => {
      erreur = await result.current.toggleHabit(1);
    });

    expect(erreur).toBeNull();
    expect(mockedHabitService.checkHabit).not.toHaveBeenCalled();
  });
});
