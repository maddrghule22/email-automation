'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function Customer360Page() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/customers/${id}`)
      .then(res => res.json())
      .then(json => {
        setCustomer(json.data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-8">Loading Customer 360...</div>;
  if (!customer) return <div className="p-8">Customer not found</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-8 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-500 mt-1">Tax ID: {customer.taxId || 'N/A'}</p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
            {customer.status}
          </span>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Invoices</h3>
            <p className="text-2xl font-semibold">{customer.invoices?.length || 0}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sales Orders</h3>
            <p className="text-2xl font-semibold">0</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Payments Received</h3>
            <p className="text-2xl font-semibold">$0.00</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customer.invoices?.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No invoices found</td></tr>
              ) : (
                customer.invoices?.map((inv: any) => (
                  <tr key={inv.id}>
                    <td className="px-6 py-4 text-blue-600 font-medium">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">${Number(inv.totalAmount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-semibold">{inv.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
