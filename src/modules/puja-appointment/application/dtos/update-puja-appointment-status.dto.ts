import { PujaAppointmentStatus } from "../../infrastructure/persistence/entities/puja-appointment.entity";

export class UpdatePujaAppointmentStatusDto {
  status?: PujaAppointmentStatus;
  expert_message?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  price?: number;
}
