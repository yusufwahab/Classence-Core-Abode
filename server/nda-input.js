import {z} from 'zod';
export const ndaInput=z.object({
 agreement_id:z.string().uuid(),
 full_name:z.string().trim().min(1).max(500),
 phone:z.string().trim().min(5).max(40),
 position:z.string().trim().max(500).optional().default(''),
 address:z.string().trim().max(2000).optional().default(''),
 signature_method:z.enum(['drawn','uploaded']),
 signature:z.string().max(2800000),
 accepted:z.literal(true),
});
