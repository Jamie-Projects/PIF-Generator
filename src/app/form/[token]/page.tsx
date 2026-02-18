import FormWizard from '@/components/FormWizard';
import { prisma } from '@/lib/prisma';
import { BASPI_SECTIONS } from '@/lib/baspiSchema';

async function getFormData(token: string) {
  const session = await prisma.formSession.findUnique({
    where: { token },
    include: {
      company: { select: { name: true } },
      propertyForm: {
        include: {
          sections: {
            orderBy: { sectionKey: 'asc' },
          },
        },
      },
    },
  });

  if (!session || session.status === 'EXPIRED') {
    return null;
  }

  const sectionOrder = BASPI_SECTIONS.map(s => s.key);
  const sortedSections = session.propertyForm?.sections
    .slice()
    .sort((a, b) => sectionOrder.indexOf(a.sectionKey) - sectionOrder.indexOf(b.sectionKey));

  return {
    sessionId: session.id,
    companyName: session.company.name,
    status: session.status,
    currentStep: session.currentStep,
    form: {
      id: session.propertyForm?.id || '',
      address: session.propertyForm?.address || '',
      postcode: session.propertyForm?.postcode || '',
      sellerName: session.propertyForm?.sellerName || '',
      sellerEmail: session.propertyForm?.sellerEmail || '',
    },
    sections: sortedSections?.map(s => ({
      id: s.id,
      sectionKey: s.sectionKey,
      title: s.title,
      status: s.status,
      data: s.data as Record<string, unknown>,
      lastSavedAt: s.lastSavedAt?.toISOString() || null,
    })) || [],
  };
}

export default async function FormPage({ params }: { params: { token: string } }) {
  const data = await getFormData(params.token);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Form Not Found</h2>
          <p className="text-gray-600">
            This form link is invalid or has expired. Please contact your property agent for a new link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <FormWizard
      token={params.token}
      sessionId={data.sessionId}
      companyName={data.companyName}
      initialStep={data.currentStep}
      form={data.form}
      sections={data.sections}
      isCompleted={data.status === 'COMPLETED'}
    />
  );
}
