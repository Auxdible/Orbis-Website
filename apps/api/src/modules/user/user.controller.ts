// users.controller.ts
import {Body, Controller, Delete, Get, Patch, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
import {ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags} from '@nestjs/swagger';
import {UpdateProfileDto} from "./dtos/update-profile.dto";
import {UserService} from "./user.service";
import {Session, UserSession} from "@thallesp/nestjs-better-auth";
import {FileInterceptor} from '@nestjs/platform-express';

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(private readonly usersService: UserService) {
    }

    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({summary: 'Get current user profile'})
    async getMe(@Session() session: UserSession) {
        return this.usersService.findById(session.user.id);
    }

    @Patch('me')
    @ApiBearerAuth()
    @ApiOperation({summary: 'Update current user profile'})
    async updateMe(
        @Session() session: UserSession,
        @Body() updateDto: UpdateProfileDto,
    ) {
        return this.usersService.updateProfile(session.user.id, updateDto);
    }

    @Post('me/image')
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({summary: 'Upload profile image'})
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(
        @Session() session: UserSession,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.usersService.uploadProfileImage(session.user.id, file);
    }

    @Delete('me/image')
    @ApiBearerAuth()
    @ApiOperation({summary: 'Delete profile image'})
    async deleteImage(@Session() session: UserSession) {
        return this.usersService.deleteProfileImage(session.user.id);
    }
}