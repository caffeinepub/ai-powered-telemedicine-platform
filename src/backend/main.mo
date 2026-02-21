import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  let patients = Map.empty<Text, Patient>();
  let appointments = Map.empty<Text, Appointment>();
  let consultationSessions = Map.empty<Text, ConsultationSession>();

  let patientOwners = Map.empty<Text, Principal>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    role : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type Patient = {
    id : Text;
    name : Text;
    age : Nat;
    medicalHistory : Text;
  };

  public type Appointment = {
    id : Text;
    patientId : Text;
    doctorId : Principal;
    time : Time.Time;
    reason : Text;
  };

  public type ConsultationSession = {
    id : Text;
    appointmentId : Text;
    notes : Text;
    prescription : ?Text;
    followUpDate : ?Time.Time;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  func isPatientOwner(caller : Principal, patientId : Text) : Bool {
    switch (patientOwners.get(patientId)) {
      case (?owner) { Principal.equal(owner, caller) };
      case (null) { false };
    };
  };

  func isAppointmentDoctor(caller : Principal, appointmentId : Text) : Bool {
    switch (appointments.get(appointmentId)) {
      case (?appointment) { Principal.equal(appointment.doctorId, caller) };
      case (null) { false };
    };
  };

  func canAccessAppointment(caller : Principal, appointment : Appointment) : Bool {
    Principal.equal(appointment.doctorId, caller) or isPatientOwner(caller, appointment.patientId);
  };

  public shared ({ caller }) func createPatient(patient : Patient) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create patients");
    };
    patients.add(patient.id, patient);
    patientOwners.add(patient.id, caller);
  };

  public shared ({ caller }) func updatePatient(id : Text, updated : Patient) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update patients");
    };
    if (not patients.containsKey(id)) {
      Runtime.trap("Patient with id " # id # " does not exist");
    };
    if (not (isPatientOwner(caller, id) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: You can only update your own patient records");
    };
    patients.add(id, updated);
  };

  public shared ({ caller }) func deletePatient(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete patients");
    };
    if (not (isPatientOwner(caller, id) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: You can only delete your own patient records");
    };
    if (not patients.containsKey(id)) {
      Runtime.trap("Patient with id " # id # " does not exist");
    };
    patients.remove(id);
    patientOwners.remove(id);
  };

  public query ({ caller }) func getPatient(id : Text) : async ?Patient {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view patients");
    };
    if (not (isPatientOwner(caller, id) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: You can only view your own patient records");
    };
    patients.get(id);
  };

  public query ({ caller }) func getAllPatients() : async [Patient] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view patients");
    };
    if (AccessControl.isAdmin(accessControlState, caller)) {
      patients.values().toArray();
    } else {
      Iter.fromArray<(Text, Patient)>(patients.entries().toArray())
      .filter(func((patientId, patient)) { isPatientOwner(caller, patientId) })
      .map(func((_, patient)) { patient })
      .toArray();
    };
  };

  public shared ({ caller }) func createAppointment(appointment : Appointment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create appointments");
    };
    if (not (isPatientOwner(caller, appointment.patientId) or Principal.equal(appointment.doctorId, caller))) {
      Runtime.trap("Unauthorized: You can only create appointments for your own patients or as the assigned doctor");
    };
    appointments.add(appointment.id, appointment);
  };

  public shared ({ caller }) func updateAppointment(id : Text, updated : Appointment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update appointments");
    };
    switch (appointments.get(id)) {
      case (?existing) {
        if (not (canAccessAppointment(caller, existing) or AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: You can only update your own appointments");
        };
        appointments.add(id, updated);
      };
      case (null) { Runtime.trap("Appointment with id " # id # " does not exist") };
    };
  };

  public shared ({ caller }) func deleteAppointment(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete appointments");
    };
    switch (appointments.get(id)) {
      case (?existing) {
        if (not (canAccessAppointment(caller, existing) or AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: You can only delete your own appointments");
        };
        appointments.remove(id);
      };
      case (null) { Runtime.trap("Appointment with id " # id # " does not exist") };
    };
  };

  public query ({ caller }) func getAppointment(id : Text) : async ?Appointment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view appointments");
    };
    switch (appointments.get(id)) {
      case (?appointment) {
        if (not (canAccessAppointment(caller, appointment) or AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: You can only view your own appointments");
        };
        ?appointment;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getAllAppointments() : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view appointments");
    };
    if (AccessControl.isAdmin(accessControlState, caller)) {
      appointments.values().toArray();
    } else {
      appointments.values().filter(func(appointment) { canAccessAppointment(caller, appointment) }).toArray();
    };
  };

  public shared ({ caller }) func createConsultationSession(session : ConsultationSession) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create consultation sessions");
    };
    if (not (isAppointmentDoctor(caller, session.appointmentId) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only the assigned doctor can create consultation sessions");
    };
    consultationSessions.add(session.id, session);
  };

  public shared ({ caller }) func updateConsultationSession(id : Text, updated : ConsultationSession) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update consultation sessions");
    };
    switch (consultationSessions.get(id)) {
      case (?existing) {
        if (not (isAppointmentDoctor(caller, existing.appointmentId) or AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: Only the assigned doctor can update consultation sessions");
        };
        consultationSessions.add(id, updated);
      };
      case (null) { Runtime.trap("Consultation session with id " # id # " does not exist") };
    };
  };

  public shared ({ caller }) func deleteConsultationSession(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete consultation sessions");
    };
    switch (consultationSessions.get(id)) {
      case (?existing) {
        if (not (isAppointmentDoctor(caller, existing.appointmentId) or AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: Only the assigned doctor can delete consultation sessions");
        };
        consultationSessions.remove(id);
      };
      case (null) { Runtime.trap("Consultation session with id " # id # " does not exist") };
    };
  };

  public query ({ caller }) func getConsultationSession(id : Text) : async ?ConsultationSession {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view consultation sessions");
    };
    switch (consultationSessions.get(id)) {
      case (?session) {
        switch (appointments.get(session.appointmentId)) {
          case (?appointment) {
            if (not (canAccessAppointment(caller, appointment) or AccessControl.isAdmin(accessControlState, caller))) {
              Runtime.trap("Unauthorized: You can only view consultation sessions for your own appointments");
            };
            ?session;
          };
          case (null) { null };
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getAllConsultationSessions() : async [ConsultationSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view consultation sessions");
    };
    if (AccessControl.isAdmin(accessControlState, caller)) {
      consultationSessions.values().toArray();
    } else {
      consultationSessions.values().filter(func(session) {
        switch (appointments.get(session.appointmentId)) {
          case (?appointment) { canAccessAppointment(caller, appointment) };
          case (null) { false };
        };
      }).toArray();
    };
  };

  public query ({ caller }) func getAppointmentsByPatient(patientId : Text) : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view appointments");
    };
    if (not (isPatientOwner(caller, patientId) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: You can only view appointments for your own patients");
    };
    appointments.values().filter(func(appointment) {
      appointment.patientId == patientId;
    }).toArray();
  };

  public query ({ caller }) func getConsultationsByAppointment(appointmentId : Text) : async [ConsultationSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view consultation sessions");
    };
    switch (appointments.get(appointmentId)) {
      case (?appointment) {
        if (not (canAccessAppointment(caller, appointment) or AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: You can only view consultation sessions for your own appointments");
        };
      };
      case (null) { Runtime.trap("Appointment with id " # appointmentId # " does not exist") };
    };
    consultationSessions.values().filter(func(session) {
      session.appointmentId == appointmentId;
    }).toArray();
  };
};
