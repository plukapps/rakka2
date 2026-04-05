// ============================================================
// Domain Types — mirrors Firebase RTDB data model
// ============================================================

// --- Establishment ---

export type EstablishmentStatus = "active" | "archived";

export interface Establishment {
  id: string;
  name: string;
  description: string;
  location: string;
  ownerId: string;
  status: EstablishmentStatus;
  createdAt: number;
}

// --- Animal ---

export type AnimalStatus = "active" | "exited";
export type AnimalCategory =
  | "vaca"
  | "toro"
  | "ternero"
  | "ternera"
  | "vaquillona"
  | "novillo"
  | "otro";
export type AnimalSex = "male" | "female";
export type AnimalEntryType = "purchase" | "birth" | "transfer";
export type AnimalExitType = "sale" | "dispatch" | "death" | "transfer" | null;

export interface Animal {
  id: string;
  estId: string;
  caravana: string;
  status: AnimalStatus;
  category: AnimalCategory;
  breed: string;
  sex: AnimalSex;
  birthDate: string | null; // ISO date string
  entryWeight: number | null;
  origin: string;
  entryType: AnimalEntryType;
  entryDate: number; // timestamp
  lotId: string | null;
  exitDate: number | null;
  exitType: AnimalExitType;
  hasActiveCarencia: boolean;
  carenciaExpiresAt: number | null;
  createdAt: number;
  updatedAt: number;
}

// --- Lot ---

export type LotStatus = "active" | "dissolved";

export interface Lot {
  id: string;
  estId: string;
  name: string;
  description: string;
  status: LotStatus;
  animalCount: number;
  createdAt: number;
}

// --- Activities ---

export type ActivityType =
  | "sanitary"
  | "commercial"
  | "field_control"
  | "movement"
  | "reproduction"
  | "general";

export type SelectionMethod =
  | "rfid_bluetooth"
  | "rfid_file"
  | "lot"
  | "individual";

// Sanitary
export type SanitarySubtype = "vaccination" | "treatment";
export type AdministrationRoute =
  | "subcutaneous"
  | "intramuscular"
  | "oral"
  | "topical"
  | "other";

export interface SanitaryFields {
  subtype: SanitarySubtype;
  product: string;
  dose: string;
  route: AdministrationRoute;
  carenciaDays: number;
  carenciaExpiresAt: number;
}

// Commercial
export type CommercialSubtype = "sale" | "dispatch";
export type CommercialStatus = "draft" | "confirmed";

export interface CommercialFields {
  subtype: CommercialSubtype;
  buyer: string;
  destination: string;
  pricePerHead: number | null;
  totalPrice: number | null;
  status: CommercialStatus;
}

// Field Control
export type FieldControlSubtype =
  | "weighing"
  | "count"
  | "body_condition"
  | "pregnancy_check"
  | "other";

export interface FieldControlFields {
  subtype: FieldControlSubtype;
  weightKg: number | null;
  weightsByAnimal?: Record<string, number> | null;
  scale: string | null;
  result: string | null;
}

// Movement
export type MovementSubtype =
  | "paddock_move"
  | "field_transfer"
  | "external_transfer";

export interface MovementFields {
  subtype: MovementSubtype;
  origin: string;
  destination: string;
  destinationEstablishmentId: string | null;
}

// Reproduction
export type ReproductionSubtype =
  | "service"
  | "pregnancy_diagnosis"
  | "birth"
  | "weaning";
export type ServiceType =
  | "natural"
  | "artificial_insemination"
  | "embryo_transfer";
export type PregnancyResult = "positive" | "negative" | "uncertain";
export type BirthResult = "live" | "stillborn" | "abortion";

export interface ReproductionFields {
  subtype: ReproductionSubtype;
  serviceType: ServiceType | null;
  pregnancyResult: PregnancyResult | null;
  birthResult: BirthResult | null;
  offspringCaravana: string | null;
}

// General
export interface GeneralFields {
  title: string;
}

// Activity (union)
export interface ActivityBase {
  id: string;
  estId: string;
  type: ActivityType;
  animalIds: string[];
  selectionMethod: SelectionMethod;
  rfidReadingId: string | null;
  activityDate: number;
  responsible: string;
  notes: string;
  createdAt: number;
  createdBy: string;
}

export interface SanitaryActivity extends ActivityBase, SanitaryFields {
  type: "sanitary";
}

export interface CommercialActivity extends ActivityBase, CommercialFields {
  type: "commercial";
}

export interface FieldControlActivity extends ActivityBase, FieldControlFields {
  type: "field_control";
}

export interface MovementActivity extends ActivityBase, MovementFields {
  type: "movement";
}

export interface ReproductionActivity extends ActivityBase, ReproductionFields {
  type: "reproduction";
}

export interface GeneralActivity extends ActivityBase, GeneralFields {
  type: "general";
}

export type Activity =
  | SanitaryActivity
  | CommercialActivity
  | FieldControlActivity
  | MovementActivity
  | ReproductionActivity
  | GeneralActivity;

// --- RFID Reading ---

export type RfidMethod = "bluetooth" | "file_upload";

export interface RfidReading {
  id: string;
  estId: string;
  method: RfidMethod;
  fileName: string | null;
  animalIds: string[];
  unknownCaravanas: string[];
  activityId: string | null;
  responsible: string;
  notes: string;
  timestamp: number;
  createdBy: string;
}

// --- Traceability ---

export type TraceabilityEventType =
  | "entry"
  | "lot_assignment"
  | "lot_change"
  | "lot_removal"
  | "sanitary_activity"
  | "commercial_activity"
  | "field_control"
  | "movement"
  | "reproduction"
  | "general_activity"
  | "rfid_reading"
  | "exit"
  | "correction";

export interface TraceabilityEvent {
  id: string;
  animalId: string;
  estId: string;
  type: TraceabilityEventType;
  description: string;
  activityId: string | null;
  lotId: string | null;
  lotName: string | null;
  responsibleName: string | null;
  timestamp: number;
  createdAt: number;
}

// --- Alerts ---

export type AlertType = "carencia_expiring" | "lot_inactive";
export type AlertUrgency = "info" | "warning" | "critical";
export type AlertStatus = "active" | "resolved" | "dismissed";

export interface Alert {
  id: string;
  estId: string;
  type: AlertType;
  urgency: AlertUrgency;
  status: AlertStatus;
  animalId: string | null;
  animalCaravana: string | null;
  lotId: string | null;
  lotName: string | null;
  description: string;
  relevantDate: number;
  daysUntilExpiry: number | null;
  createdAt: number;
  resolvedAt: number | null;
  dismissedAt: number | null;
}

// --- User ---

export interface User {
  uid: string;
  name: string;
  email: string;
  establishmentIds: Record<string, true>;
  createdAt: number;
}

// --- Lot index ---

export type LotAnimalsIndex = Record<string, Record<string, Record<string, true>>>;
