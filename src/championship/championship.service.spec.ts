import { Test, TestingModule } from '@nestjs/testing'
import { ChampionshipService } from './championship.service'

describe('ChampionshipService', () => {
  let service: ChampionshipService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChampionshipService],
    }).compile()

    service = module.get<ChampionshipService>(ChampionshipService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
