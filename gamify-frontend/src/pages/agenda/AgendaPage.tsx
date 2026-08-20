import { useState } from 'react';
import type { FC } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AgendaHeader } from '@/features/agenda/components/AgendaHeader';
import { TimeGrid } from '@/features/agenda/components/TimeGrid';
import { MonthView } from '@/features/agenda/components/MonthView';
import { EventForm } from '@/features/agenda/components/EventForm';
import { useAgendaEvents } from '@/features/agenda/hooks/useAgendaEvents';
import { agendaService } from '@/features/agenda/services/agendaService';
import {
  addDays,
  startOfMonth,
  startOfWeek,
  toIsoDate,
  toIsoDateTime,
} from '@/features/agenda/utils/date';
import type {
  AgendaEvent,
  AgendaEventRequest,
  AgendaSeriesUpdateRequest,
  AgendaView,
} from '@/features/agenda/types/agenda.types';

interface ModalState {
  event?: AgendaEvent;
  date: string;
  startTime: string;
}

const computeRange = (view: AgendaView, currentDate: Date): { from: Date; to: Date } => {
  if (view === 'JOUR') {
    const from = new Date(currentDate);
    from.setHours(0, 0, 0, 0);
    return { from, to: addDays(from, 1) };
  }
  if (view === 'MOIS') {
    const from = startOfWeek(startOfMonth(currentDate));
    return { from, to: addDays(from, 42) };
  }
  const from = startOfWeek(currentDate);
  return { from, to: addDays(from, 7) };
};

export const AgendaPage: FC = () => {
  const [view, setView] = useState<AgendaView>('SEMAINE');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [modal, setModal] = useState<ModalState | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const range = computeRange(view, currentDate);
  const { events, isLoading, error, refetch } = useAgendaEvents(
    toIsoDateTime(range.from),
    toIsoDateTime(range.to),
  );

  const navigate = (direction: -1 | 1) => {
    if (view === 'MOIS') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    } else {
      setCurrentDate(addDays(currentDate, direction * (view === 'SEMAINE' ? 7 : 1)));
    }
  };

  const runAction = async (action: () => Promise<unknown>, closeModal: boolean) => {
    setSubmitting(true);
    setActionError(null);
    try {
      await action();
      if (closeModal) setModal(null);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (request: AgendaEventRequest) => {
    const editing = modal?.event;
    runAction(
      () =>
        editing
          ? agendaService.updateEvent(editing.id, request)
          : agendaService.createEvent(request),
      true,
    );
  };

  const handleDelete = () => {
    const editing = modal?.event;
    if (!editing) return;
    if (!window.confirm(`Supprimer l'événement « ${editing.titre} » ?`)) return;
    runAction(() => agendaService.deleteEvent(editing.id), true);
  };

  const handleSubmitSeries = (request: AgendaSeriesUpdateRequest) => {
    const editing = modal?.event;
    if (!editing) return;
    runAction(() => agendaService.updateEventSeries(editing.id, request), true);
  };

  const handleDeleteSeries = () => {
    const editing = modal?.event;
    if (!editing) return;
    if (!window.confirm(`Supprimer TOUTE la série « ${editing.titre} » ?`)) return;
    runAction(() => agendaService.deleteEventSeries(editing.id), true);
  };

  const handleEventDrop = (eventId: number, day: Date, hour: number) => {
    const moved = events.find((item) => item.id === eventId);
    if (!moved) return;
    const durationMinutes =
      (new Date(moved.dateFin).getTime() - new Date(moved.dateDebut).getTime()) / 60000;
    const newStart = new Date(day);
    newStart.setHours(hour, 0, 0, 0);
    const newEnd = new Date(newStart.getTime() + durationMinutes * 60000);
    runAction(
      () =>
        agendaService.updateEvent(moved.id, {
          titre: moved.titre,
          dateDebut: toIsoDateTime(newStart),
          dateFin: toIsoDateTime(newEnd),
          ...(moved.activityId !== null ? { activityId: moved.activityId } : {}),
        }),
      false,
    );
  };

  const openCreate = (day: Date, hour: number) =>
    setModal({ date: toIsoDate(day), startTime: `${String(hour).padStart(2, '0')}:00` });

  const timeGridDays =
    view === 'SEMAINE'
      ? Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(currentDate), index))
      : [currentDate];

  return (
    <section className="flex flex-col gap-5">
      <AgendaHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onNavigate={navigate}
        onToday={() => setCurrentDate(new Date())}
        onCreate={() => openCreate(currentDate, 9)}
      />

      {actionError && !modal && <p className="text-[15px] text-danger">{actionError}</p>}
      {isLoading && <p className="text-[15px] text-text-muted">Chargement de l'agenda...</p>}
      {error && <p className="text-[15px] text-danger">{error.message}</p>}

      {!isLoading && !error && view !== 'MOIS' && (
        <TimeGrid
          days={timeGridDays}
          events={events}
          onSlotClick={openCreate}
          onEventClick={(event) =>
            setModal({
              event,
              date: event.dateDebut.slice(0, 10),
              startTime: event.dateDebut.slice(11, 16),
            })
          }
          onEventDrop={handleEventDrop}
        />
      )}

      {!isLoading && !error && view === 'MOIS' && (
        <MonthView
          currentDate={currentDate}
          events={events}
          onSelectDay={(day) => {
            setCurrentDate(day);
            setView('JOUR');
          }}
        />
      )}

      <Modal
        isOpen={modal !== null}
        title={modal?.event ? 'Modifier l’événement' : 'Nouvel événement'}
        onClose={() => setModal(null)}
      >
        {actionError && <p className="mb-3 text-[14px] text-danger">{actionError}</p>}
        {modal && (
          <EventForm
            initialEvent={modal.event}
            defaultDate={modal.date}
            defaultStartTime={modal.startTime}
            onSubmit={handleSubmit}
            onSubmitSeries={handleSubmitSeries}
            onDelete={modal.event ? handleDelete : undefined}
            onDeleteSeries={modal.event ? handleDeleteSeries : undefined}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>
    </section>
  );
};
