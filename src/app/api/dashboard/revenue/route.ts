import { NextRequest, NextResponse } from 'next/server';
import { getAllTrainingInvoices } from '@/lib/database.pg';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    
    const invoices = await getAllTrainingInvoices();
    
    // Filter invoices by year and month if provided
    let filteredInvoices = invoices;
    
    if (year) {
      filteredInvoices = filteredInvoices.filter(invoice => {
        const invoiceDate = invoice.invoice_date || invoice.created_at;
        if (!invoiceDate) return false;
        const invoiceYear = new Date(invoiceDate).getFullYear().toString();
        return invoiceYear === year;
      });
    }
    
    if (month) {
      filteredInvoices = filteredInvoices.filter(invoice => {
        const invoiceDate = invoice.invoice_date || invoice.created_at;
        if (!invoiceDate) return false;
        const invoiceMonth = (new Date(invoiceDate).getMonth() + 1).toString().padStart(2, '0');
        return invoiceMonth === month;
      });
    }
    
    // Group by month and year
    const revenueByMonth: { [key: string]: number } = {};
    const revenueByYear: { [key: string]: number } = {};
    
    filteredInvoices.forEach(invoice => {
      const invoiceDate = invoice.invoice_date || invoice.created_at;
      if (invoiceDate) {
        const date = new Date(invoiceDate);
        const yearKey = date.getFullYear().toString();
        const monthKey = `${yearKey}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // Aggregate by month
        revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + invoice.total_invoice_amount;
        
        // Aggregate by year
        revenueByYear[yearKey] = (revenueByYear[yearKey] || 0) + invoice.total_invoice_amount;
      }
    });
    
    // Convert to arrays for chart data
    const monthlyData = Object.entries(revenueByMonth)
      .map(([month, revenue]) => ({
        month,
        revenue,
        year: month.split('-')[0],
        monthNumber: parseInt(month.split('-')[1])
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    const yearlyData = Object.entries(revenueByYear)
      .map(([year, revenue]) => ({
        year,
        revenue
      }))
      .sort((a, b) => a.year.localeCompare(b.year));
    
    // Get available years and months for filters
    const allYears = Array.from(new Set(invoices.map(invoice => {
      const invoiceDate = invoice.invoice_date || invoice.created_at;
      return invoiceDate ? new Date(invoiceDate).getFullYear().toString() : null;
    }).filter(Boolean))).sort();
    
    const allMonths = Array.from(new Set(invoices.map(invoice => {
      const invoiceDate = invoice.invoice_date || invoice.created_at;
      return invoiceDate ? (new Date(invoiceDate).getMonth() + 1).toString().padStart(2, '0') : null;
    }).filter(Boolean))).sort();
    
    return NextResponse.json({
      success: true,
      data: {
        monthlyData,
        yearlyData,
        totalRevenue: filteredInvoices.reduce((sum, invoice) => sum + invoice.total_invoice_amount, 0),
        totalInvoices: filteredInvoices.length,
        availableYears: allYears,
        availableMonths: allMonths
      }
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
} 