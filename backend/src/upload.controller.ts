import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import * as AWS from 'aws-sdk';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env file
config({ path: join(__dirname, '../.env') });

@Controller('audio')
export class AudioController {
  private readonly lambda: AWS.Lambda;

  constructor() {
    AWS.config.update({ 
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
    });
    this.lambda = new AWS.Lambda({ apiVersion: '2015-03-31' });
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('audio'))
  async uploadAudio(@UploadedFile() audioFile: any ,fileName : string) {
    const functionName = process.env.LAMBDA_FUNCTION_NAME;
    const params = {
      FunctionName: functionName,
      Payload: JSON.stringify({
        audioData: audioFile.buffer.toString('base64'),
        fileName : fileName
      })
    };
    const result = await this.lambda.invoke(params).promise();
    console.log(result);
  }
}
