# Modèles de Données MY GODFATHER

## Diagramme des Relations

```ascii
User
├── MentorMenteePair (mentor_id)
├── MentorMenteePair (mentee_id)
├── MentoringSession (via pair)
├── Message (sender/receiver)
├── Notification (user_id)
└── TeamsChat (via pair)

MentorMenteePair
├── User (mentor_id)
├── User (mentee_id)
├── MentoringSession (pair_id)
└── TeamsChat (pair_id)

MentoringSession
├── MentorMenteePair (pair_id)
└── SessionFeedback (session_id)

MatchingLog
├── User (mentee_id)
└── User (suggestions.mentor_id)

Message
├── User (sender_id)
└── User (receiver_id)

TeamsChat
└── MentorMenteePair (pair_id)
```

## Modèles Détaillés

### 1. User
```javascript
{
    _id: ObjectId,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    passwordVisible: String,  // Pour l'admin
    name: { type: String, required: true },
    prenom: { type: String, required: true },
    age: { type: Number, required: true },
    service: { type: String, required: true },
    fonction: { type: String, required: true },
    anciennete: { type: Number, required: true },
    role: { type: String, enum: ['admin', 'rh', 'mentor', 'mentee'] },
    teams_id: String,
    disponibilite: { type: Boolean, default: true },
    last_login: Date,
    last_active: Date,
    notification_preferences: {
        email: { enabled: Boolean, categories: {} },
        teams: { enabled: Boolean, categories: {} },
        web: { enabled: Boolean, categories: {} }
    },
    deletedAt: Date,
    timestamps: true
}
```

### 2. MentorMenteePair
```javascript
{
    _id: ObjectId,
    mentor_id: { type: ObjectId, ref: 'User' },
    mentee_id: { type: ObjectId, ref: 'User' },
    status: { 
        type: String, 
        enum: ['pending', 'active', 'rejected', 'inactive'] 
    },
    validated_by: { type: ObjectId, ref: 'User' },
    validated_at: Date,
    rejected_by: { type: ObjectId, ref: 'User' },
    rejection_reason: String,
    feedback: [{
        given_by: { type: ObjectId, ref: 'User' },
        rating: Number,
        comment: String,
        created_at: Date
    }],
    start_date: Date,
    end_date: Date,
    end_reason: String,
    created_at: Date
}
```

### 3. MentoringSession
```javascript
{
    _id: ObjectId,
    pair_id: { type: ObjectId, ref: 'MentorMenteePair' },
    date: { type: Date, required: true },
    duration: { type: Number, required: true },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled']
    },
    topic: String,
    objectives: [String],
    location: { type: String, default: 'Teams' },
    teams_meeting_id: String,
    teams_meeting_url: String,
    feedback: [{
        user_id: { type: ObjectId, ref: 'User' },
        rating: Number,
        categories: {
            communication: Number,
            preparation: Number,
            engagement: Number,
            value: Number
        },
        comment: String,
        created_at: Date
    }],
    notes: String,
    cancelled_at: Date,
    cancellation_reason: String,
    completed_at: Date,
    created_at: Date
}
```

### 4. MatchingLog
```javascript
{
    _id: ObjectId,
    menteeId: { type: ObjectId, ref: 'User' },
    suggestions: [{
        mentorId: { type: ObjectId, ref: 'User' },
        compatibilityScore: Number,
        details: {
            anciennete: Number,
            ageDiff: Number,
            service: Boolean
        },
        createdAt: Date
    }]
}
```

### 5. Message
```javascript
{
    _id: ObjectId,
    sender_id: { type: ObjectId, ref: 'User' },
    receiver_id: { type: ObjectId, ref: 'User' },
    content: { type: String, required: true },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read']
    },
    attachments: [{
        name: String,
        url: String,
        type: String
    }],
    created_at: Date,
    read_at: Date,
    deleted_for: [{ type: ObjectId, ref: 'User' }]
}
```

### 6. TeamsChat
```javascript
{
    _id: ObjectId,
    pair_id: { type: ObjectId, ref: 'MentorMenteePair' },
    teams_channel_id: { type: String, required: true },
    teams_chat_id: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'close', 'archived']
    },
    last_activity: Date,
    messages_count: { type: Number, default: 0 },
    created_at: Date
}
```

### 7. Notification
```javascript
{
    _id: ObjectId,
    user_id: { type: ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error']
    },
    category: {
        type: String,
        enum: ['matching', 'session', 'message', 'system']
    },
    status: {
        type: String,
        enum: ['unread', 'read'],
        default: 'unread'
    },
    link: String,
    created_at: Date,
    read_at: Date
}
```

### 8. Import
```javascript
{
    _id: ObjectId,
    file_name: { type: String, required: true },
    file_type: {
        type: String,
        enum: ['csv', 'excel']
    },
    imported_by: { type: ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed']
    },
    total_records: Number,
    processed_records: Number,
    failed_records: Number,
    error_log: [{
        row: Number,
        error: String
    }],
    created_at: Date,
    completed_at: Date
}
```

## Indexes Importants

```javascript
// User
User.index({ email: 1 }, { unique: true });
User.index({ role: 1 });
User.index({ service: 1 });
User.index({ deletedAt: 1 });

// MentorMenteePair
MentorMenteePair.index({ mentor_id: 1, status: 1 });
MentorMenteePair.index({ mentee_id: 1, status: 1 });

// MentoringSession
MentoringSession.index({ pair_id: 1 });
MentoringSession.index({ date: 1 });
MentoringSession.index({ status: 1 });

// Message
Message.index({ sender_id: 1, receiver_id: 1 });
Message.index({ created_at: -1 });

// TeamsChat
TeamsChat.index({ pair_id: 1 });
TeamsChat.index({ last_activity: -1 });

// Notification
Notification.index({ user_id: 1, status: 1 });
Notification.index({ created_at: -1 });
```

## Validation et Contraintes

1. **Utilisateurs**
   - Email unique
   - Âge minimum 18 ans
   - Ancienneté >= 0

2. **Paires**
   - Un mentor ne peut pas avoir plus de 3 mentorés actifs
   - Un mentoré ne peut avoir qu'un mentor actif

3. **Sessions**
   - Date future uniquement
   - Durée minimum 30 minutes

4. **Messages**
   - Contenu non vide
   - Taille maximale des pièces jointes

## Soft Delete

Les modèles suivants supportent le soft delete :
- User
- MentorMenteePair
- Message

## Timestamps

Tous les modèles incluent :
- `created_at`
- `updated_at` (via mongoose timestamps)
