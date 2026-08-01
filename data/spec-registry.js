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
    },

    "aqa-a-psych-3.1.1": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 1",
      code: "3.1.1", title: "Social influence", aliases: ["PSY-SI"]
    },
    "aqa-a-psych-3.1.2": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 1",
      code: "3.1.2", title: "Memory", aliases: ["PSY-MEM"]
    },
    "aqa-a-psych-3.1.3": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 1",
      code: "3.1.3", title: "Attachment", aliases: ["PSY-ATT"]
    },
    "aqa-a-psych-3.1.4": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 1",
      code: "3.1.4", title: "Psychopathology", aliases: ["PSY-PATH"]
    },
    "aqa-a-psych-3.2.1": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 2",
      code: "3.2.1", title: "Approaches in Psychology", aliases: ["PSY-APP"]
    },
    "aqa-a-psych-3.2.2": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 2",
      code: "3.2.2", title: "Biopsychology", aliases: ["PSY-BIO"]
    },
    "aqa-a-psych-3.2.3": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 2",
      code: "3.2.3", title: "Research methods", aliases: ["PSY-RM"]
    },
    "aqa-a-psych-3.3.1": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.1", title: "Issues and debates in Psychology", aliases: ["PSY-ID"]
    },
    "aqa-a-psych-3.3.2": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.2", title: "Relationships", aliases: ["PSY-REL"]
    },
    "aqa-a-psych-3.3.3": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.3", title: "Gender", aliases: ["PSY-GEN"]
    },
    "aqa-a-psych-3.3.4": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.4", title: "Cognition and development", aliases: ["PSY-COG"]
    },
    "aqa-a-psych-3.3.5": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.5", title: "Schizophrenia", aliases: ["PSY-SCH"]
    },
    "aqa-a-psych-3.3.6": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.6", title: "Eating behaviour", aliases: ["PSY-EAT"]
    },
    "aqa-a-psych-3.3.7": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.7", title: "Stress", aliases: ["PSY-STR"]
    },
    "aqa-a-psych-3.3.8": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.8", title: "Aggression", aliases: ["PSY-AGG"]
    },
    "aqa-a-psych-3.3.9": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.9", title: "Forensic Psychology", aliases: ["PSY-FOR"]
    },
    "aqa-a-psych-3.3.10": {
      subject: "psych", board: "AQA", qualification: "A-level Psychology (7182)", paper: "Paper 3",
      code: "3.3.10", title: "Addiction", aliases: ["PSY-ADD"]
    },

    "aqa-a-soc-3.1.1": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 1",
      code: "3.1.1", title: "Education", aliases: ["SOC-EDU"]
    },
    "aqa-a-soc-3.1.2": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 1",
      code: "3.1.2", title: "Methods in Context", aliases: ["SOC-MET"]
    },
    "aqa-a-soc-3.1.3": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 1",
      code: "3.1.3", title: "Theory and Methods", aliases: ["SOC-THEORY"]
    },
    "aqa-a-soc-3.2.1": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 2",
      code: "3.2.1", title: "Culture and Identity", aliases: []
    },
    "aqa-a-soc-3.2.2": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 2",
      code: "3.2.2", title: "Families and Households", aliases: ["SOC-FAM"]
    },
    "aqa-a-soc-3.2.3": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 2",
      code: "3.2.3", title: "Health", aliases: []
    },
    "aqa-a-soc-3.2.4": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 2",
      code: "3.2.4", title: "Work, Poverty and Welfare", aliases: []
    },
    "aqa-a-soc-3.2.5": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 2",
      code: "3.2.5", title: "Beliefs in Society", aliases: ["SOC-BEL"]
    },
    "aqa-a-soc-3.2.6": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 2",
      code: "3.2.6", title: "Global Development", aliases: ["SOC-GLOB"]
    },
    "aqa-a-soc-3.2.7": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 2",
      code: "3.2.7", title: "The Media", aliases: ["SOC-MED"]
    },
    "aqa-a-soc-3.2.8": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 2",
      code: "3.2.8", title: "Stratification and Differentiation", aliases: ["SOC-STRAT"]
    },
    "aqa-a-soc-3.3.1": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 3",
      code: "3.3.1", title: "Crime and Deviance", aliases: ["SOC-CRIME"]
    },
    "aqa-a-soc-3.3.2": {
      subject: "soc", board: "AQA", qualification: "A-level Sociology (7192)", paper: "Paper 3",
      code: "3.3.2", title: "Theory and Methods", aliases: ["SOC-RESEARCH"]
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
    ,"PSY-SI": "aqa-a-psych-3.1.1"
    ,"PSY-MEM": "aqa-a-psych-3.1.2"
    ,"PSY-ATT": "aqa-a-psych-3.1.3"
    ,"PSY-PATH": "aqa-a-psych-3.1.4"
    ,"PSY-APP": "aqa-a-psych-3.2.1"
    ,"PSY-BIO": "aqa-a-psych-3.2.2"
    ,"PSY-RM": "aqa-a-psych-3.2.3"
    ,"PSY-ID": "aqa-a-psych-3.3.1"
    ,"PSY-REL": "aqa-a-psych-3.3.2"
    ,"PSY-GEN": "aqa-a-psych-3.3.3"
    ,"PSY-COG": "aqa-a-psych-3.3.4"
    ,"PSY-SCH": "aqa-a-psych-3.3.5"
    ,"PSY-EAT": "aqa-a-psych-3.3.6"
    ,"PSY-STR": "aqa-a-psych-3.3.7"
    ,"PSY-AGG": "aqa-a-psych-3.3.8"
    ,"PSY-FOR": "aqa-a-psych-3.3.9"
    ,"PSY-ADD": "aqa-a-psych-3.3.10"
    ,"SOC-EDU": "aqa-a-soc-3.1.1"
    ,"SOC-MET": "aqa-a-soc-3.1.2"
    ,"SOC-THEORY": "aqa-a-soc-3.1.3"
    ,"SOC-FAM": "aqa-a-soc-3.2.2"
    ,"SOC-BEL": "aqa-a-soc-3.2.5"
    ,"SOC-GLOB": "aqa-a-soc-3.2.6"
    ,"SOC-MED": "aqa-a-soc-3.2.7"
    ,"SOC-STRAT": "aqa-a-soc-3.2.8"
    ,"SOC-CRIME": "aqa-a-soc-3.3.1"
    ,"SOC-RESEARCH": "aqa-a-soc-3.3.2"
  }
};
