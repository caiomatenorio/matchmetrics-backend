import { Test, TestingModule } from '@nestjs/testing';
import { LogOutController } from './log-out.controller';

describe('LogOutController', () => {
  let controller: LogOutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogOutController],
    }).compile();

    controller = module.get<LogOutController>(LogOutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
