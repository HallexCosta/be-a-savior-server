import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { BaseEntity } from '@entities/BaseEntity'
import { Ong } from '@entities/Ong'

@Entity('incidents')
export class Incident extends BaseEntity {
  @Column()
  public readonly name: string

  @Column()
  public readonly description: string

  @Column()
  public readonly coast: number

  @Column()
  public readonly ong_id: string

  @JoinColumn({ name: 'ong_id' })
  @ManyToOne(() => Ong)
  public readonly ong: Ong
}
