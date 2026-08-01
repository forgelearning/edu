// Canonical exam-board specification metadata for Forge.
//
// This file deliberately contains specification structure, not question data.
// Question banks may keep their existing `spec` value while a subject is
// migrated; validation resolves that value through this registry.  Once a
// subject is fully migrated, questions can additionally use `specPointId`.

const SPEC_REGISTRY = {
  version: 1,
  points: {
    "edexcel-a-econ-1.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 1",
      code: "1.1",
      title: "Supply and demand",
      aliases: ["ECON-1.1"]
    },
    "edexcel-a-econ-2.1.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.1.1",
      title: "Economic growth",
      aliases: ["2.1.1"]
    },
    "edexcel-a-econ-2.1.2": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.1.2",
      title: "Inflation",
      aliases: ["2.1.2"]
    },
    "edexcel-a-econ-2.1.3": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.1.3",
      title: "Employment and unemployment",
      aliases: ["2.1.3"]
    },
    "edexcel-a-econ-2.1.4": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.1.4",
      title: "Balance of payments",
      aliases: ["2.1.4"]
    },
    "edexcel-a-econ-2.2.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.2.1",
      title: "Aggregate demand",
      aliases: ["2.2.1"]
    },
    "edexcel-a-econ-2.2.2": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.2.2",
      title: "Aggregate supply",
      aliases: ["2.2.2"]
    },
    "edexcel-a-econ-2.2.3": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.2.3",
      title: "National income",
      aliases: ["2.2.3"]
    },
    "edexcel-a-econ-2.3.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.3.1",
      title: "Fiscal policy",
      aliases: ["2.3.1"]
    },
    "edexcel-a-econ-2.3.2": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.3.2",
      title: "Monetary policy",
      aliases: ["2.3.2"]
    },
    "edexcel-a-econ-2.3.3": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.3.3",
      title: "Supply-side policies",
      aliases: ["2.3.3"]
    },
    "edexcel-a-econ-2.4.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.4.1",
      title: "Inequality",
      aliases: ["2.4.1"]
    },
    "edexcel-a-econ-2.4.2": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.4.2",
      title: "Poverty",
      aliases: ["2.4.2"]
    },
    "edexcel-a-econ-2.5.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.5.1",
      title: "Financial markets",
      aliases: ["2.5.1"]
    },
    "edexcel-a-econ-2.5.2": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.5.2",
      title: "Role of banks",
      aliases: ["2.5.2"]
    },
    "edexcel-a-econ-2.5.3": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 2",
      code: "2.5.3",
      title: "Central banks",
      aliases: ["2.5.3"]
    },
    "edexcel-a-econ-3.1.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 3",
      code: "3.1.1",
      title: "Business growth and objectives",
      aliases: ["3.1.1"]
    },
    "edexcel-a-econ-3.2.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 3",
      code: "3.2.1",
      title: "Revenue, costs and profit",
      aliases: ["3.2.1"]
    },
    "edexcel-a-econ-4.1.1": {
      subject: "econ",
      board: "Edexcel",
      qualification: "A Level Economics A (9EC0)",
      paper: "Paper 3",
      code: "4.1.1",
      title: "Globalisation and trade",
      aliases: ["4.1.1"]
    }
  },

  aliases: {
    "ECON-1.1": "edexcel-a-econ-1.1",
    "1.1": "edexcel-a-econ-1.1",
    "2.1.1": "edexcel-a-econ-2.1.1",
    "2.1.2": "edexcel-a-econ-2.1.2",
    "2.1.3": "edexcel-a-econ-2.1.3",
    "2.1.4": "edexcel-a-econ-2.1.4",
    "2.2.1": "edexcel-a-econ-2.2.1",
    "2.2.2": "edexcel-a-econ-2.2.2",
    "2.2.3": "edexcel-a-econ-2.2.3",
    "2.3.1": "edexcel-a-econ-2.3.1",
    "2.3.2": "edexcel-a-econ-2.3.2",
    "2.3.3": "edexcel-a-econ-2.3.3",
    "2.4.1": "edexcel-a-econ-2.4.1",
    "2.4.2": "edexcel-a-econ-2.4.2",
    "2.5.1": "edexcel-a-econ-2.5.1",
    "2.5.2": "edexcel-a-econ-2.5.2",
    "2.5.3": "edexcel-a-econ-2.5.3",
    "3.1.1": "edexcel-a-econ-3.1.1",
    "3.2.1": "edexcel-a-econ-3.2.1",
    "4.1.1": "edexcel-a-econ-4.1.1"
  }
};
