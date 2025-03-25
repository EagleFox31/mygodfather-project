const { Client } = require('@microsoft/microsoft-graph-client');
const { ConfidentialClientApplication } = require('@azure/msal-node');
const config = require('../config/config');
require('isomorphic-fetch');

class TeamsService {
    constructor() {
        // Configuration MSAL pour l'authentification
        this.msalConfig = {
            auth: {
                clientId: config.teams.clientId,
                clientSecret: config.teams.clientSecret,
                authority: `https://login.microsoftonline.com/${config.teams.tenantId}`
            }
        };

        this.cca = new ConfidentialClientApplication(this.msalConfig);
        this.graphClient = null;
    }

    /**
     * Initialise le client Graph avec un token d'accès
     */
    async initGraphClient() {
        try {
            const result = await this.cca.acquireTokenByClientCredential({
                scopes: ['https://graph.microsoft.com/.default']
            });

            this.graphClient = Client.init({
                authProvider: (done) => {
                    done(null, result.accessToken);
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du client Graph:', error);
            throw error;
        }
    }

    /**
     * Crée un canal Teams pour une paire mentor-mentoré
     */
    async createChannel(pairId, mentorName, menteeName) {
        try {
            if (!this.graphClient) {
                await this.initGraphClient();
            }

            // Créer un nom unique pour le canal
            const channelName = `mentor-${mentorName}-${menteeName}-${Date.now()}`.toLowerCase()
                .replace(/[^a-z0-9-]/g, '-')
                .replace(/-+/g, '-')
                .substring(0, 50);

            // Créer le canal dans l'équipe par défaut
            const channel = await this.graphClient.api(`/teams/${config.teams.defaultTeamId}/channels`)
                .post({
                    displayName: channelName,
                    description: `Canal de mentorat pour ${mentorName} et ${menteeName}`,
                    membershipType: 'private'
                });

            // Ajouter le mentor et le mentoré comme membres du canal
            await this.addMembersToChannel(channel.id, [mentorId, menteeId]);

            return channel;
        } catch (error) {
            console.error('Erreur lors de la création du canal Teams:', error);
            throw error;
        }
    }

    /**
     * Ajoute des membres à un canal Teams
     */
    async addMembersToChannel(channelId, memberIds) {
        try {
            if (!this.graphClient) {
                await this.initGraphClient();
            }

            const addMemberPromises = memberIds.map(memberId =>
                this.graphClient.api(`/teams/${config.teams.defaultTeamId}/channels/${channelId}/members`)
                    .post({
                        '@odata.type': '#microsoft.graph.aadUserConversationMember',
                        userId: memberId,
                        roles: ['owner']
                    })
            );

            await Promise.all(addMemberPromises);
        } catch (error) {
            console.error('Erreur lors de l\'ajout des membres au canal:', error);
            throw error;
        }
    }

    /**
     * Crée une réunion Teams
     */
    async createMeeting({ title, startTime, duration, participants }) {
        try {
            if (!this.graphClient) {
                await this.initGraphClient();
            }

            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + duration);

            const meeting = await this.graphClient.api('/users/default/onlineMeetings')
                .post({
                    startDateTime: startTime.toISOString(),
                    endDateTime: endTime.toISOString(),
                    subject: title,
                    participants: {
                        attendees: participants.map(email => ({
                            emailAddress: { address: email },
                            role: 'presenter'
                        }))
                    }
                });

            return meeting;
        } catch (error) {
            console.error('Erreur lors de la création de la réunion Teams:', error);
            throw error;
        }
    }

    /**
     * Met à jour une réunion Teams
     */
    async updateMeeting(meetingId, { title, startTime, duration, participants }) {
        try {
            if (!this.graphClient) {
                await this.initGraphClient();
            }

            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + duration);

            const meeting = await this.graphClient.api(`/users/default/onlineMeetings/${meetingId}`)
                .patch({
                    startDateTime: startTime.toISOString(),
                    endDateTime: endTime.toISOString(),
                    subject: title,
                    participants: {
                        attendees: participants.map(email => ({
                            emailAddress: { address: email },
                            role: 'presenter'
                        }))
                    }
                });

            return meeting;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la réunion Teams:', error);
            throw error;
        }
    }

    /**
     * Archive un canal Teams
     */
    async archiveChannel(channelId) {
        try {
            if (!this.graphClient) {
                await this.initGraphClient();
            }

            await this.graphClient.api(`/teams/${config.teams.defaultTeamId}/channels/${channelId}`)
                .patch({
                    membershipType: 'private',
                    displayName: `[Archivé] ${channelName}`
                });

            return true;
        } catch (error) {
            console.error('Erreur lors de l\'archivage du canal Teams:', error);
            throw error;
        }
    }
}

module.exports = new TeamsService();
