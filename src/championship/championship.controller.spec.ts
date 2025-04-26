import { Test, TestingModule } from '@nestjs/testing'
import { ChampionshipController } from './championship.controller'

describe('ChampionshipController', () => {
  let controller: ChampionshipController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChampionshipController],
    }).compile()

    controller = module.get<ChampionshipController>(ChampionshipController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
