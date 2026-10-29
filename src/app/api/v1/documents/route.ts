export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getD1Documents, createD1Document } from '@/lib/d1';
import { SessionService } from '@/lib/auth/session';

const SEEDED_DOCUMENTS = [
  {
    id: 'doc-vorynex-inv-089',
    title: 'Invoice-INV-2026-089.pdf',
    fileName: 'Invoice-INV-2026-089.pdf',
    originalFilename: 'Invoice-INV-2026-089.pdf',
    source: 'Email Attachment (billing@acrocorp.com)',
    fileSize: '1.2 MB',
    documentType: 'INVOICE',
    status: 'COMPLETED',
    confidence: 0.98,
    createdAt: 'Today, 09:40 AM',
    metadata: {
      vendor: 'Acro Corporation Inc.',
      amount: 14250.00,
      currency: 'USD',
      dueDate: '2026-11-15',
      tax: 1250.00,
      poNumber: 'PO-77401'
    }
  },
  {
    id: 'doc-vorynex-req',
    title: 'Project_Requirements.pdf',
    fileName: 'Project_Requirements.pdf',
    originalFilename: 'Project_Requirements.pdf',
    source: 'Email Attachment (info@client.com)',
    fileSize: '2.4 MB',
    documentType: 'REQUIREMENTS',
    status: 'COMPLETED',
    confidence: 0.94,
    createdAt: 'Today, 10:24 AM',
    metadata: {
      client: 'ABC Technologies',
      project: 'Website Redesign & AI Portal',
      budget: '₹ 2,50,000',
      deadline: '2026-10-30'
    }
  },
  {
    id: 'doc-vorynex-po-984',
    title: 'PO_OmniLogistics_98441.pdf',
    fileName: 'PO_OmniLogistics_98441.pdf',
    originalFilename: 'PO_OmniLogistics_98441.pdf',
    source: 'API Ingestion (ERP Sync)',
    fileSize: '840 KB',
    documentType: 'PURCHASE_ORDER',
    status: 'COMPLETED',
    confidence: 0.96,
    createdAt: 'Today, 08:15 AM',
    metadata: {
      vendor: 'Omni Logistics Ltd.',
      amount: 8400.00,
      currency: 'USD',
      deliveryDate: '2026-11-05'
    }
  },
  {
    id: 'doc-vorynex-tax-w9',
    title: 'Form_W9_Corporate_2026.pdf',
    fileName: 'Form_W9_Corporate_2026.pdf',
    originalFilename: 'Form_W9_Corporate_2026.pdf',
    source: 'Secure SFTP Upload',
    fileSize: '720 KB',
    documentType: 'TAX_FORM',
    status: 'COMPLETED',
    confidence: 0.99,
    createdAt: 'Yesterday, 04:30 PM',
    metadata: {
      entity: 'Vorynex Technologies Inc.',
      einStatus: 'Verified & Active',
      year: '2026'
    }
  },
  {
    id: 'doc-vorynex-contract',
    title: 'Master_Services_Agreement_Nexus.pdf',
    fileName: 'Master_Services_Agreement_Nexus.pdf',
    originalFilename: 'Master_Services_Agreement_Nexus.pdf',
    source: 'Email Attachment (legal@nexus.com)',
    fileSize: '3.3 MB',
    documentType: 'CONTRACT',
    status: 'COMPLETED',
    confidence: 0.92,
    createdAt: '22 Oct 2026, 02:15 PM',
    metadata: {
      parties: 'Vorynex & Nexus Solutions Group',
      term: '3 Years',
      liabilityCap: '$2,000,000'
    }
  }
];

export async function GET(request: Request) {
  try {
    let tenantId = 'tenant-vorynex-prod';
    try {
      const session = await SessionService.getSession();
      if (session?.tenantId) {
        tenantId = session.tenantId;
      }
    } catch {}

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || undefined;

    let data = await getD1Documents(tenantId, status);
    if (!data || data.length === 0) {
      data = SEEDED_DOCUMENTS;
    }

    return successResponse({ data, nextCursor: undefined });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    let tenantId = 'tenant-vorynex-prod';
    try {
      const session = await SessionService.getSession();
      if (session?.tenantId) tenantId = session.tenantId;
    } catch {}

    const body = await request.json();
    const doc = await createD1Document(tenantId, body);
    return successResponse(doc, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
