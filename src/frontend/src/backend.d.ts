import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface ConsultationSession {
    id: string;
    prescription?: string;
    notes: string;
    appointmentId: string;
    followUpDate?: Time;
}
export interface Appointment {
    id: string;
    doctorId: Principal;
    patientId: string;
    time: Time;
    reason: string;
}
export interface UserProfile {
    name: string;
    role: string;
}
export interface Patient {
    id: string;
    age: bigint;
    name: string;
    medicalHistory: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAppointment(appointment: Appointment): Promise<void>;
    createConsultationSession(session: ConsultationSession): Promise<void>;
    createPatient(patient: Patient): Promise<void>;
    deleteAppointment(id: string): Promise<void>;
    deleteConsultationSession(id: string): Promise<void>;
    deletePatient(id: string): Promise<void>;
    getAllAppointments(): Promise<Array<Appointment>>;
    getAllConsultationSessions(): Promise<Array<ConsultationSession>>;
    getAllPatients(): Promise<Array<Patient>>;
    getAppointment(id: string): Promise<Appointment | null>;
    getAppointmentsByPatient(patientId: string): Promise<Array<Appointment>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConsultationSession(id: string): Promise<ConsultationSession | null>;
    getConsultationsByAppointment(appointmentId: string): Promise<Array<ConsultationSession>>;
    getPatient(id: string): Promise<Patient | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAppointment(id: string, updated: Appointment): Promise<void>;
    updateConsultationSession(id: string, updated: ConsultationSession): Promise<void>;
    updatePatient(id: string, updated: Patient): Promise<void>;
}
