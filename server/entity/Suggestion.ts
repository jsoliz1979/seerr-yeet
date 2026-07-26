import {
  SuggestionCategory,
  SuggestionStatus,
} from '@server/constants/suggestion';
import { DbAwareColumn, resolveDbType } from '@server/utils/DbColumnHelper';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
class Suggestion {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'integer', default: SuggestionCategory.SUGGESTION })
  public category: SuggestionCategory;

  @Column({ type: 'integer', default: SuggestionStatus.NEW })
  @Index()
  public status: SuggestionStatus;

  @Column({ type: 'text' })
  public message: string;

  @Column({ type: 'varchar', nullable: true })
  public pageUrl?: string | null;

  @ManyToOne(() => User, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Index()
  public createdBy?: User | null;

  @ManyToOne(() => User, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  public modifiedBy?: User | null;

  @DbAwareColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @UpdateDateColumn({
    type: resolveDbType('datetime'),
    default: () => 'CURRENT_TIMESTAMP',
  })
  public updatedAt: Date;

  constructor(init?: Partial<Suggestion>) {
    Object.assign(this, init);
  }
}

export default Suggestion;
