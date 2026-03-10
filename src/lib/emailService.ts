export interface CateringFormData {
    name: string;
    email: string;
    phone: string;
    date: string;
    guests: string;
    serviceType: string;
    address: string;
    message: string;
}

/**
 * Sends both the customer confirmation and the admin notification via the Vercel API.
 */
export async function sendCateringEmails(
    data: CateringFormData,
): Promise<{ customerSent: boolean; adminSent: boolean; error?: string }> {
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send email');
        }

        return {
            customerSent: true,
            adminSent: true,
        };
    } catch (error) {
        console.error('Email error:', error);
        return {
            customerSent: false,
            adminSent: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred',
        };
    }
}
