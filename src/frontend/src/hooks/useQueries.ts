import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Patient, Appointment, ConsultationSession, UserProfile } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllPatients() {
  const { actor, isFetching } = useActor();

  return useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPatients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: Patient) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPatient(patient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useUpdatePatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patient }: { id: string; patient: Patient }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePatient(id, patient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useDeletePatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePatient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useGetAllAppointments() {
  const { actor, isFetching } = useActor();

  return useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAppointments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: Appointment) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAppointment(appointment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useUpdateAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, appointment }: { id: string; appointment: Appointment }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAppointment(id, appointment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useDeleteAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAppointment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useGetConsultationSession(sessionId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ConsultationSession | null>({
    queryKey: ['consultationSession', sessionId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getConsultationSession(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

export function useGetConsultationsByAppointment(appointmentId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ConsultationSession[]>({
    queryKey: ['consultationsByAppointment', appointmentId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConsultationsByAppointment(appointmentId);
    },
    enabled: !!actor && !isFetching && !!appointmentId,
  });
}

export function useCreateConsultationSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: ConsultationSession) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createConsultationSession(session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultationSession'] });
      queryClient.invalidateQueries({ queryKey: ['consultationsByAppointment'] });
    },
  });
}

export function useUpdateConsultationSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, session }: { id: string; session: ConsultationSession }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateConsultationSession(id, session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultationSession'] });
      queryClient.invalidateQueries({ queryKey: ['consultationsByAppointment'] });
    },
  });
}
