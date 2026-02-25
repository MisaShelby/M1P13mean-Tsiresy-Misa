const CommissionType = require('../../models/CommissionType');

// ==============================
// CREATE
// ==============================
exports.createCommissionType = async (req, res) => {
    try {
        const { nom, tarif, description } = req.body;

        const commissionType = await CommissionType.create({
            nom,
            tarif,
            description
        });

        res.status(201).json({
            message: "Type de commission créé avec succès",
            data: commissionType
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// ==============================
// READ ALL
// ==============================
exports.getAllCommissionTypes = async (req, res) => {
    try {
        const commissionTypes = await CommissionType.find().sort({ createdAt: -1 });

        res.status(200).json(commissionTypes);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==============================
// READ ONE
// ==============================
exports.getCommissionTypeById = async (req, res) => {
    try {
        const commissionType = await CommissionType.findById(req.params.id);

        if (!commissionType) {
            return res.status(404).json({ message: "Type de commission introuvable" });
        }

        res.status(200).json(commissionType);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==============================
// UPDATE
// ==============================
exports.updateCommissionType = async (req, res) => {
    try {
        const commissionType = await CommissionType.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!commissionType) {
            return res.status(404).json({ message: "Type de commission introuvable" });
        }

        res.status(200).json({
            message: "Type de commission mis à jour",
            data: commissionType
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// ==============================
// DELETE
// ==============================
exports.deleteCommissionType = async (req, res) => {
    try {
        const commissionType = await CommissionType.findByIdAndDelete(req.params.id);

        if (!commissionType) {
            return res.status(404).json({ message: "Type de commission introuvable" });
        }

        res.status(200).json({
            message: "Type de commission supprimé avec succès"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};