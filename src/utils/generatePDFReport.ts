import PDFDocument from 'pdfkit';

export function generatePDFReport(username: string, sessions: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc.fontSize(20).text(`Study Report for ${username}`, { align: 'center' });
    doc.moveDown();

    sessions.forEach(session => {
      const startTime = session.beginTime.toLocaleString();
      const endTime = session.finishTime ? session.finishTime.toLocaleString() : 'In Progress';
      const duration = session.duration
        ? `${Math.floor(session.duration / 3600)}h ${Math.floor((session.duration % 3600) / 60)}m`
        : 'N/A';

      doc.fontSize(12).text(`Session ID: ${session._id}`);
      doc.text(`Start Time: ${startTime}`);
      doc.text(`End Time: ${endTime}`);
      doc.text(`Duration: ${duration}`);
      doc.moveDown();
    });

    doc.end();
  });
}