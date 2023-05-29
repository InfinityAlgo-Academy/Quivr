import os

import llm.LANGUAGE_PROMPT as LANGUAGE_PROMPT
from langchain.chains import ConversationalRetrievalChain
from langchain.chat_models import AzureChatOpenAI
from langchain.chat_models.anthropic import ChatAnthropic
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.llms import OpenAI
from langchain.memory import ConversationBufferMemory
from langchain.vectorstores import SupabaseVectorStore
from supabase import Client, create_client
from utils import ChatMessage

openai_api_key = os.environ.get("OPENAI_API_KEY")
openai_api_type = os.environ.get("OPENAI_API_TYPE")
openai_api_version = os.environ.get("OPENAI_API_VERSION")
openai_api_base = os.environ.get("OPENAI_API_BASE")
openai_api_deployment = os.environ.get("OPENAI_API_DEPLOYMENT")

anthropic_api_key = os.environ.get("ANTHROPIC_API_KEY")
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
supabase_client: Client = create_client(supabase_url, supabase_key)
vector_store = SupabaseVectorStore(
    supabase_client, embeddings, table_name="documents")
memory = ConversationBufferMemory(
    memory_key="chat_history", return_messages=True)


def get_qa_llm(chat_message: ChatMessage):
    qa = None
    # this overwrites the built-in prompt of the ConversationalRetrievalChain
    ConversationalRetrievalChain.prompts = LANGUAGE_PROMPT
    if openai_api_type and openai_api_type == "azure":
        qa = ConversationalRetrievalChain.from_llm(
            AzureChatOpenAI(
                temperature=chat_message.temperature,
                model_name=chat_message.model,
                openai_api_base=openai_api_base,
                openai_api_version=openai_api_version,
                deployment_name=openai_api_deployment,
                openai_api_key=openai_api_key,
                openai_api_type = openai_api_type,
                verbose=True
            ),
            vector_store.as_retriever(),
            memory=memory,
            verbose=False,
            max_tokens_limit=1024
        )

    elif chat_message.model.startswith("gpt"):
        qa = ConversationalRetrievalChain.from_llm(
            OpenAI(
                model_name=chat_message.model, openai_api_key=openai_api_key, temperature=chat_message.temperature, max_tokens=chat_message.max_tokens), vector_store.as_retriever(), memory=memory, verbose=False, max_tokens_limit=1024)
    elif anthropic_api_key and chat_message.model.startswith("claude"):
        qa = ConversationalRetrievalChain.from_llm(
            ChatAnthropic(
                model=chat_message.model, anthropic_api_key=anthropic_api_key, temperature=chat_message.temperature, max_tokens_to_sample=chat_message.max_tokens), vector_store.as_retriever(), memory=memory, verbose=False, max_tokens_limit=102400)
    return qa
