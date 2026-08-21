package com.gamify.domain.entities;

import com.gamify.domain.enums.Attribut;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Ticket dette technique (tests automatisés) : couvre {@link UserProfile#ajouterXp(int)}
 * et les seuils de niveaux ({@link UserProfile#seuilXpPourNiveau(int)}). Le ticket
 * d'origine nommait "User.ajouterXp", mais cette logique vit sur {@code UserProfile}
 * depuis la séparation credentials/profil (V15/V16, voir roadmap.md) — testée ici où
 * elle vit réellement.
 */
class UserProfileTest {

    @Test
    void seuilXpPourNiveau_premiersNiveaux_retourneSeuilsDoublants() {
        assertThat(UserProfile.seuilXpPourNiveau(1)).isZero();
        assertThat(UserProfile.seuilXpPourNiveau(2)).isEqualTo(100);
        assertThat(UserProfile.seuilXpPourNiveau(3)).isEqualTo(300);
        assertThat(UserProfile.seuilXpPourNiveau(4)).isEqualTo(700);
    }

    @Test
    void seuilXpPourNiveau_niveauTresEleve_retourneMaxValuePourEviterDebordement() {
        assertThat(UserProfile.seuilXpPourNiveau(25)).isEqualTo(Integer.MAX_VALUE);
        assertThat(UserProfile.seuilXpPourNiveau(100)).isEqualTo(Integer.MAX_VALUE);
    }

    @Test
    void ajouterXp_sousLeSeuil_resteAuNiveau1() {
        UserProfile profile = new UserProfile();

        profile.ajouterXp(50);

        assertThat(profile.getXpTotal()).isEqualTo(50);
        assertThat(profile.getNiveau()).isEqualTo(1);
        assertThat(profile.getTitre()).isEqualTo("Novice");
    }

    @Test
    void ajouterXp_atteintExactementLeSeuil_passeAuNiveauSuivantEtChangeDeTitre() {
        UserProfile profile = new UserProfile();

        profile.ajouterXp(100);

        assertThat(profile.getXpTotal()).isEqualTo(100);
        assertThat(profile.getNiveau()).isEqualTo(2);
        assertThat(profile.getTitre()).isEqualTo("Initié");
    }

    @Test
    void ajouterXp_franchitPlusieursSeuilsEnUnSeulGain_montePlusieursNiveaux() {
        UserProfile profile = new UserProfile();

        profile.ajouterXp(700);

        assertThat(profile.getXpTotal()).isEqualTo(700);
        assertThat(profile.getNiveau()).isEqualTo(4);
        assertThat(profile.getTitre()).isEqualTo("Guerrier");
    }

    @Test
    void ajouterXp_gainsCumules_atteintLeMemeNiveauQuUnGainUnique() {
        UserProfile profile = new UserProfile();

        profile.ajouterXp(60);
        profile.ajouterXp(40);

        assertThat(profile.getXpTotal()).isEqualTo(100);
        assertThat(profile.getNiveau()).isEqualTo(2);
    }

    @Test
    void appliquerGainAttribut_sansMontantExplicite_ajouteUnPoint() {
        UserProfile profile = new UserProfile();

        profile.appliquerGainAttribut(Attribut.INT);

        assertThat(profile.getValeurAttribut(Attribut.INT)).isEqualTo(11);
    }

    @Test
    void appliquerGainAttribut_avecMontantExplicite_ajouteExactementCeMontant() {
        // Ticket G2-T16 : bonus +2 au lieu de +1 quand une photo preuve est jointe.
        UserProfile profile = new UserProfile();

        profile.appliquerGainAttribut(Attribut.FOR, 2);

        assertThat(profile.getValeurAttribut(Attribut.FOR)).isEqualTo(12);
    }

    @Test
    void retirerXp_apresMonteeDeNiveau_niveauNeBaisseJamais() {
        UserProfile profile = new UserProfile();
        profile.ajouterXp(100);

        profile.retirerXp(100);

        assertThat(profile.getXpTotal()).isZero();
        assertThat(profile.getNiveau()).isEqualTo(2);
        assertThat(profile.getTitre()).isEqualTo("Initié");
    }
}
