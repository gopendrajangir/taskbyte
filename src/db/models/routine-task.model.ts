import { CategoryType } from '@/components';
import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export class Routine extends Model {
  static table = 'routine_tasks';

  @field('title') title!: string;
  @field('notes') notes!: string | null;
  @field('category') category!: CategoryType;

  @field('due_at') dueAt!: number | null;
  @field('has_time') hasTime!: boolean;

  // stored as JSON string in DB
  @field('weeks') weeks!: string;

  @field('last_generated_at') lastGeneratedAt!: Date | null;
  @field('synced') synced!: boolean;
  @field('deleted') deleted!: boolean;

  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}

export interface RoutineData {
  id: string;
  title: string;
  notes: string | null;
  category: CategoryType;
  dueAt: number | null;
  hasTime: boolean;

  // stored as JSON string in DB
  weeks: string;

  lastGeneratedAt: number | null;
  synced?: boolean;
  deleted?: boolean;

  createdAt: number;
  updatedAt: number;
}
