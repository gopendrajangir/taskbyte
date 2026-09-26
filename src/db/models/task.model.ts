import { CategoryType } from '@/components';
import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export class Task extends Model {
  static table = 'tasks';

  @field('title') title!: string;
  @field('notes') notes!: string | null;
  @field('category') category!: CategoryType;

  @field('due_at') dueAt!: number | null;
  @field('has_time') hasTime!: boolean;

  @field('done') done!: boolean;
  @field('is_routine') isRoutine!: boolean | null;

  @field('routine_id') routineId!: string | null;
  @field('synced') synced!: boolean;
  @field('deleted') deleted!: boolean;

  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}

export interface TaskData {
  id: string;
  title: string;
  notes: string | null;
  category: CategoryType;
  dueAt: number | null;
  hasTime: boolean;
  done: boolean;
  isRoutine: boolean | null;
  routineId: string | null;
  synced?: boolean;
  deleted?: boolean;
  createdAt: number;
  updatedAt: number;
}
