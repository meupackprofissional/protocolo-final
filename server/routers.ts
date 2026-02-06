import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { sendLeadEvent } from "./meta-capi";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  tracking: router({
    recordLead: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          fbp: z.string().optional(),
          fbc: z.string().optional(),
          clientIpAddress: z.string().optional(),
          clientUserAgent: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await sendLeadEvent({
            email: input.email,
            fbp: input.fbp,
            fbc: input.fbc,
            clientIpAddress: input.clientIpAddress || ctx.req.ip,
            clientUserAgent: input.clientUserAgent || ctx.req.headers['user-agent'],
          });

          return {
            success: true,
            eventId: result.eventId,
          };
        } catch (error) {
          console.error('[tRPC] Error recording lead:', error);
          // Nao falhar a requisicao se Meta falhar
          return {
            success: true,
            eventId: undefined,
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
