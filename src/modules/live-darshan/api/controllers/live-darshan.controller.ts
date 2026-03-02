import { Controller, Get } from '@nestjs/common';
import { LiveDarshanFacade } from '../../application/live-darshan.facade';
import { Public } from '@/common/decorators/public.decorator';

@Controller('v1/live-darshan')
export class LiveDarshanController {
    constructor(private readonly liveDarshanFacade: LiveDarshanFacade) { }

    @Public()
    @Get()
    async getLiveDarshans() {
        const data = await this.liveDarshanFacade.getLiveDarshans();
        return {
            success: true,
            message: 'Live Darshan list fetched successfully.',
            data,
        };
    }
}
