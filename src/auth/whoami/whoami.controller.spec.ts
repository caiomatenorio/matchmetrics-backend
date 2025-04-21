import { Test, TestingModule } from '@nestjs/testing'
import { WhoamiController } from './whoami.controller'

describe('WhoamiController', () => {
  let controller: WhoamiController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhoamiController],
    }).compile()

    controller = module.get<WhoamiController>(WhoamiController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
