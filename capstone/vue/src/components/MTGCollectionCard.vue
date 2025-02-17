<template>
  <main>
    <h1 class="collection-name">
      <span class="background-span">{{ collection.collectionName }}</span>
    </h1>

    <div v-if="isUpdating" class="loading-container">
      <h1>Pulling your cards from another plane...</h1>
      <img src="../img/loading-zndrsplt.gif" alt="Loading" />
    </div>

    <div class="card-list" v-else>
      <div
        v-for="card in currentCollection"
        :key="card.id"
        class="magic-card"
        :class="{ flipped: card.isFlipped }"
      >
        <div class="card-image">
          <button
            @click="deleteCardById(card.id)"
            v-if="showDeleteButton()"
            class="delete-button"
          >
            <img src="../img/trashicon.png" class="delete-icon" />
          </button>
          <div class="flip-button-container" @click="flipCard(card)">
            <img
              v-if="card.frontFace && card.backFace"
              class="flip-button"
              src="@/img/flip.png"
              alt="Flip Icon"
            />
          </div>
          <div class="card-image-content">
            <img
              v-if="card.isFlipped && card.backFace"
              :src="card.backFace.imageUri"
              alt="Card Back Face"
              class="card-face back-face card-pic"
            />
            <img
              v-else-if="card.frontFace"
              :src="card.frontFace.imageUri"
              alt="Card Front Face"
              class="card-face front-face card-pic"
            />
            <img
              v-else
              :src="card.imageUri"
              alt="Card Image"
              class="card-pic"
            />

            <div class="hide" :style="getPos">
              <p>Name: {{ getCard(card.id).cardName }}</p>
              <p>Condition: {{ getCard(card.id).condition }}</p>
              <p>${{ getCard(card.id).userPrice }}</p>
            </div>
          </div>
        </div>
      </div>
      <router-link
        v-bind:to="{ name: 'mtg-search-view' }"
        class="back-to-search"
      >
        <AddCardCard></AddCardCard>
      </router-link>
    </div>
  </main>
</template>
  
<script>
import collectionApiService from "../services/CollectionApiService";
import scryfallService from "../services/ScryfallService";
import AddCardCard from "../components/AddCardCard.vue";

export default {
  name: "magic-card",
  props: ["magicCardName"],
  components: { AddCardCard },

  data() {
    return {
      cardListResponse: [],
      currentCollection: [],
      collectionID: this.$route.params.id,
      collection: {},
      isUpdating: false,
      mousePosX: 0,
      mousePosY: 0,
    };
  },

  computed: {
    getPos() {
      return (
        "left:" +
        Math.floor(Math.sqrt(this.mousePosX)) +
        "px;top:" +
        (Math.floor(Math.sqrt(this.mousePosY)) - 100) +
        "px"
      );
    },
    magicCards() {
      return this.$store.state.magicCards;
    },
  },

  mounted() {
    document.addEventListener("mousemove", (event) => {
      this.mousePosX = event.clientX;
      this.mousePosY = event.clientY;
    });
  },
  created() {
    this.getCollectionFromID().then(() => {
      this.getCardsFromCollection();
    });
    this.getCollection();
  },

  methods: {
    async deleteCardById(cardId) {
      const confirmed = window.confirm(
        "Are you sure you want to remove this card from this collection?"
      );

      if (confirmed) {
        try {
          await collectionApiService.removeCardFromCollection(
            this.collectionID,
            cardId
          );
          this.$router.go();
        } catch (error) {
          console.error("Error deleting card:", error);
        }
      }
    },

    getCard(apiId) {
      return this.cardListResponse.find((card) => card.cardApiId === apiId);
    },

    async getCollectionFromID() {
      try {
        this.isUpdating = true;
        const response = await collectionApiService.getCollectionById(
          this.collectionID.toString()
        );
        this.cardListResponse = response.data.cardList;
      } catch (error) {
        console.error("Error fetching collection:", error);
      } finally {
        this.isUpdating = false;
      }
    },

    async getCollection() {
      const response = await collectionApiService.getCollectionById(
        this.collectionID.toString()
      );
      this.collection = response.data;
    },

    async getCardsFromCollection() {
      try {
        this.isUpdating = true;
        for (const card of this.cardListResponse) {
          const response = await scryfallService.getSingleCardById(
            card.cardApiId
          );
          let singleCardResponse = response.data;
          let mappedCard = {
            id: singleCardResponse.id,
            name: singleCardResponse.name,
            oracleText: singleCardResponse.oracle_text,
            setName: singleCardResponse.set_name,
            isFlipped: false,
            isDualSided:
              singleCardResponse.layout === "transform" ||
              singleCardResponse.layout === "modal_dfc",
          };
          if (
            singleCardResponse.card_faces &&
            singleCardResponse.card_faces.length > 1
          ) {
            mappedCard.frontFace = {
              name: singleCardResponse.card_faces[0].name,
              oracleText: singleCardResponse.card_faces[0].oracle_text,
              imageUri: singleCardResponse.card_faces[0].image_uris.normal,
            };
            mappedCard.backFace = {
              name: singleCardResponse.card_faces[1].name,
              oracleText: singleCardResponse.card_faces[1].oracle_text,
              imageUri: singleCardResponse.card_faces[1].image_uris.normal,
            };
          } else {
            mappedCard.imageUri = singleCardResponse.image_uris.normal;
          }
          this.currentCollection.push(mappedCard);
        }
      } catch (error) {
        console.error("Error fetching cards:", error);
      } finally {
        this.isUpdating = false;
      }
    },

    flipCard(card) {
      card.isFlipped = !card.isFlipped;
    },
    showDeleteButton() {
      return this.collection.authorId === this.$store.state.user.id;
    },
  },
};
</script>
  
  <style scoped>
.card-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.collection-name {
  text-align: center;
  margin-top: 50px;
  font-size: 28px;
  color: rgb(40, 25, 107);
  padding: 10px 0;
  border-radius: 10px;
}

.background-span {
  background-color: rgba(197, 134, 236, 0.65);
  padding: 10px 20px;
  border-radius: 10px;
  border: 2px solid #3e049d;
}

.magic-card {
  position: relative;
  display: flex;
  flex-direction: row;
  border: 2px solid #360164;
  border-radius: 10px;
  padding: 10px;
  margin: 10px;
  text-align: center;
  background-color: rgb(197, 134, 236, 0.65);
}

.flip-button {
  width: 30px;
  height: 30px;
  cursor: pointer;
  background-color: white;
  border-radius: 100px;
}

.flip-button-container {
  position: absolute;
  top: 40px;
  right: -5px;
  z-index: 1;
}

.card-image {
  position: relative;
  min-width: 270px;
  max-width: 270px;
  min-height: 378px;
  max-height: 378px;
  padding-right: 10px;
  perspective: 1000px;
}

.card-image-content {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
  backface-visibility: hidden;
  will-change: transform;
}

.card-face {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  transition: opacity 0.3s ease;
}

.card-face.back-face {
  transform: rotateY(180deg);
}

.magic-card.flipped .flip-button {
  transform: rotateY(180deg);
}

.magic-card.flipped .card-image-content {
  transform: rotateY(180deg);
}

.back-to-search {
  text-decoration: none;
}

.delete-icon {
  height: 33px;
  width: 27px;
  position: relative;
}

.delete-button {
  position: absolute;
  top: 280px;
  right: -5px;
  z-index: 1;
}

.loading-container {
  display: flex;
  flex-direction: column;
  padding-top: 220px;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading-container img {
  width: 600px;
  height: auto;
  border: solid 4px;
  border-color: #360164;
}

img {
  width: 270px;
  height: 378px;
  border-radius: 12px;
}

button {
  font-size: 16px;
  background-color: #6200ff;
  color: white;
  border: 2px solid #270cbd;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #3e049d;
}

.hide {
  display: none;
  width: 200px;
  height: 100px;
  border-radius: 20px;
  border: solid;
  background-color: rgb(40, 25, 107, 0.9);

  position: absolute;
  color: white;

  z-index: 5;
}

.hide p {
  padding: 5px;
}

.card-pic:hover + .hide {
  display: block;
}

main {
  max-width: 80%;
  margin: 0 auto;
}

</style>