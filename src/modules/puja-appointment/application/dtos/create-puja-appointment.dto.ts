import { PujaAppointmentStatus, PujaMode } from "../../infrastructure/persistence/entities/puja-appointment.entity";

export class CreatePujaAppointmentDto {
  puja_id: number;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  ask_expert_for_date: boolean;
  mode: PujaMode;
  price: number;
  user_message?: string;
}
