import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Contacts & Deals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contact / deal lead' })
  @ApiResponse({ status: 201, description: 'Contact successfully created' })
  async create(@GetUser('id') userId: string, @Body() dto: CreateContactDto) {
    return this.contactsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List contacts for authenticated user' })
  @ApiQuery({ name: 'search', required: false, description: 'Filter by name, email, or company' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by pipeline status enum' })
  @ApiResponse({ status: 200, description: 'List of contacts returned' })
  async findAll(
    @GetUser('id') userId: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.contactsService.findAll(userId, search, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact detail with associated tasks and email logs' })
  @ApiResponse({ status: 200, description: 'Contact details returned' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.contactsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update contact details or pipeline stage' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully' })
  async update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact' })
  @ApiResponse({ status: 200, description: 'Contact deleted successfully' })
  async remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.contactsService.remove(userId, id);
  }

  @Post(':id/sequence-status')
  @ApiOperation({ summary: 'Stop or Continue automated follow-up sequence after reply' })
  @ApiResponse({ status: 200, description: 'Sequence status updated' })
  async updateSequenceStatus(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body('action') action: 'STOP' | 'CONTINUE',
  ) {
    return this.contactsService.updateSequenceStatus(userId, id, action || 'STOP');
  }
}
