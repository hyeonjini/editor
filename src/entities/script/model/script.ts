import type { HttpSettings } from "@/entities/script/model/http-settings";
import type { Transaction } from "@/entities/script/model/transaction";

export interface Script {
  id: string;
  name: string;
  description?: string;
  httpSettings: HttpSettings;
  transactions: Transaction[];
  createdAt?: string;
  updatedAt?: string;
}
