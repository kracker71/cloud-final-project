import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudioService } from './audio.service';

@Controller('audios')
export class AudioController {
  constructor(private readonly service: AudioService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('audio'))
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    console.log(file);
    const url = await this.service.uploadAudioToS3(file);
    return { url };
  }
}
