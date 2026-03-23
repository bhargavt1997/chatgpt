# Bhargav Tsapparapu Resume Export

This repository now contains a structured resume page and a generated PDF export for Bhargav Tsapparapu.

## Files

- `index.html` — semantically structured HTML resume with screen and print-friendly styling.
- `scripts/generate_resume_pdf.py` — dependency-free PDF generator that exports the same resume content.
- `bhargav-tsapparapu-resume.pdf` — generated PDF artifact.

## Regenerate the PDF

```bash
python3 scripts/generate_resume_pdf.py
```

## Notes

- The HTML was normalized from the duplicated source into a single well-structured document.
- The PDF is generated locally without external libraries so it can be reproduced in restricted environments.
