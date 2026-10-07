export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { AuthorizationService } from '@/lib/auth/authorization';
import { WorkflowRepository } from '@/lib/data/workflow-repository';
import { GraphValidator } from '@/lib/engine/graph-validator';
import { createWorkflowVersionSchema } from '@/lib/validations/workflow';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/lib/errors';
import { auditService } from '@/lib/audit';
import { eventBus } from '@/lib/events/event-bus';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await AuthorizationService.authorize('workflows', 'update');
    const { tenant, user } = await AuthorizationService.resolveContext();

    const body = await request.json();
    const validated = createWorkflowVersionSchema.safeParse(body);
    if (!validated.success) {
      throw new ValidationError(validated.error.issues.map((e: any) => e.message).join(', '));
    }

    // Validate the graph before allowing publish
    const graphResult = GraphValidator.validate(validated.data.definition as any);
    if (!graphResult.valid) {
      throw new ValidationError(`Invalid workflow definition: ${graphResult.errors.join('; ')}`);
    }

    const repo = new WorkflowRepository(tenant!.id);
    const workflow = await repo.findById(id);

    // Determine next version number
    const nextVersion = (workflow.versions?.[0]?.version || 0) + 1;

    const version = await repo.createVersion(id, {
      version: nextVersion,
      definition: validated.data.definition,
    });

    // If workflow is Draft, transition to Published
    if (workflow.status === 'Draft') {
      await repo.update(id, { status: 'Published' });
    }

    await eventBus.publish({
      eventId: crypto.randomUUID(),
      eventType: 'WorkflowPublished',
      aggregateType: 'Workflow',
      aggregateId: id,
      tenantId: tenant!.id,
      version: 1,
      timestamp: new Date().toISOString(),
      payload: { versionId: version.id, versionNumber: nextVersion },
      metadata: { actorId: user.id },
    });

    await auditService.log({
      actorType: 'USER',
      actorId: user.id,
      action: 'workflow.version.published',
      resourceType: 'workflow',
      resourceId: id,
      tenantId: tenant!.id,
      metadata: { versionId: version.id, version: nextVersion },
    });

    return successResponse(version, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
