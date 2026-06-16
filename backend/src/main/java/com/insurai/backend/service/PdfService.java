package com.insurai.backend.service;

import com.insurai.backend.entity.Policy;
import com.insurai.backend.entity.User;
import com.insurai.backend.repository.PolicyRepository;
import com.insurai.backend.repository.UserRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

@Service
public class PdfService {

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private UserRepository userRepository;

    public ByteArrayInputStream createPolicyPdf(Long policyId) {
        Policy policy = policyRepository.findById(policyId).orElseThrow();
        User user = userRepository.findById(policy.getUserId()).orElseThrow();

        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // 1. TITLE
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Paragraph title = new Paragraph("Certificate of Insurance", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph("\n"));

            // 2. DETAILS
            // Note: Some PDF fonts struggle with '₹', so we use 'INR' or 'Rs.' for maximum compatibility
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            document.add(new Paragraph("Policy Holder: " + user.getFullName(), bodyFont));
            document.add(new Paragraph("Policy ID: #" + policy.getPolicyId(), bodyFont));
            document.add(new Paragraph("Plan ID: " + policy.getPlanId(), bodyFont));
            document.add(new Paragraph("------------------------------------------------"));
            document.add(new Paragraph("Start Date: " + policy.getStartDate(), bodyFont));
            document.add(new Paragraph("End Date: " + policy.getEndDate(), bodyFont));

            // Using "INR" or "Rs." to avoid PDF encoding issues with the Rupee symbol
            document.add(new Paragraph("Premium Paid: Rs. " + policy.getPremiumPaid(), bodyFont));

            document.add(new Paragraph("Status: " + policy.getStatus(), bodyFont));

            // 3. FOOTER
            document.add(new Paragraph("\n\n"));
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10);
            Paragraph footer = new Paragraph("This is a computer-generated document from InsurAI Systems.", footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}